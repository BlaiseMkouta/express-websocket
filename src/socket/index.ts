import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { SessionService } from "../services/session.service";
import {
  ChatIo,
  ChatMessage,
  conversationChannel,
  sessionChannel,
  userChannel,
} from "./types";
import { ROOMS } from "../config/room";
import prisma from "../config/prisma";
import { Message } from "../generated/prisma/client";

function toChatMessage(row: Message): ChatMessage {
  return {
    id: row.id,
    clientMessageId: row.clientMessageId,
    roomId: row.roomId,
    text: row.text,
    userId: row.userId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createSocketServer(
  httpServer: HttpServer,
  sessions: SessionService,
) {
  // Socket.IO s'accroche au serveur HTTP et intercepte les URL /socket.io/*
  const io: ChatIo = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(","),
      credentials: true, // autorise l'envoi du cookie
    },
  });

  // Middleware qui s'execute une fois, a l'ouverture de la connexion

  io.use(async (Socket, next) => {
    const auth = await sessions.authenticated(Socket.request.headers.cookie);
    if (!auth) {
      return next(new Error("unauthorized")); // Connexion refusee
    }

    //  on range les infos du user dans le socket. ca permt qu'il soit disponible partout
    Socket.data.user = auth.user;
    Socket.data.sessionId = auth.sessionId;
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`${user.name} is connected`);

    socket.join(userChannel(user.id));
    socket.join(sessionChannel(socket.data.sessionId));

    /**
     * je veux rejoindre cette room
     * 1. verifier que la room existe
     * 2. retirer le coket de l'ancienne room et ajouter au nouveau
     * 3. notifier avec un accuse de recption
     *
     */
    socket.on("conversation:open", async ({ conversationId }, ack) => {
      try {
        // verifier que la room exite
        if (!ROOMS.some((room) => room.id === conversationId)) {
          return ack({ success: false, error: "Conversation not found" });
        }

        // quitte l'ancienne room et on rejoins la nouvelle
        const previous = socket.data.conversationId;

        if (previous) {
          socket.leave(conversationChannel(previous));
        }

        socket.data.conversationId = conversationId;

        socket.join(conversationChannel(conversationId));

        // les 100 derniers messages dont retournees
        const rows = await prisma.message.findMany({
          where: { roomId: conversationId },
          take: 100,
          orderBy: { createdAt: "desc" },
        });

        ack({
          success: true,
          user,
          conversationId,
          rooms: ROOMS,
          messages: rows.map(toChatMessage),
        });
      } catch (error) {
        (console.error(error), ack({ success: false, error: "server error" }));
      }
    });

    // ENVOYER UN MESSAGE
    socket.on(
      "message:send",
      async ({ conversationId, text, clientMessageId }, ack) => {
        try {
          // verifie si la conversation existe
          if (!ROOMS.some((room) => room.id === conversationId)) {
            ack({ success: false, error: "Conversation not found" });
          }

          // enregistrer le message
          const row = await prisma.message.create({
            data: {
              clientMessageId,
              text,
              roomId: conversationId,
              userId: user.id,
              username: user.name,
            },
          });

          const message = toChatMessage(row);

          // diffuser le messge a tout les users qui regardes le salon y compris moi
          io.to(conversationChannel(conversationId)).emit(
            "message:new",
            message,
          );

          // accuser de reception
          ack({ success: true, message });
        } catch (error) {
          ack({ success: false, error: "Message not sent" });
        }
      },
    );
  });

  return io;
}
