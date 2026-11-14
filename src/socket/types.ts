import { Server, Socket } from "socket.io";
import { PublicRoom } from "../config/room";
import { StoredUser } from "../db/store";

export interface ChatMessage {
  id: string;
  clientMessageId: string;
  roomId: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface SystemEvent {
  roomId: string;
  text: string;
  createdAt: string;
}

export type ErrorResponse = { success: false; error: string };

export type OpenResponse =
  | {
      success: true;
      user: StoredUser;
      conversationId: string;
      rooms: PublicRoom[];
      messages: ChatMessage[];
    }
  | ErrorResponse;

export type MessageResponse =
  | {
      success: true;
      message: ChatMessage;
    }
  | ErrorResponse;

// ce que le navigateur envoie
// Socket.IO attend des signatures de fonction : (donnees, accuse de reception) => void
export interface ClientToServerEvents {
  "conversation:open": (
    payload: { conversationId: string },
    ack: (response: OpenResponse) => void, // acknowledgement : accuse de reception
  ) => void;
  "message:send": (
    payload: { conversationId: string; text: string; clientMessageId: string },
    ack: (response: MessageResponse) => void,
  ) => void;
}

// ce que le serveur diffuse
export interface ServerToClientEvents {
  "message:new": (message: ChatMessage) => void;
  "system:event": (event: SystemEvent) => void;
}

// Donnees rattachees a chaque socket a la connexion
export interface SocketData {
  user: StoredUser;
  sessionId: string;
  conversationId?: string;
}

export type ChatIo = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

export type ChatSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

// nommer les canaux de communication
/** onglets qui regardent une conversation */
export const conversationChannel = (id: string) => `conversation:${id}`;
/** tous les onglets d'un compte (necessaire pour les discussions privees) */
export const userChannel = (id: string) => `user:${id}`;
/** onglets ouverts avec une meme session (pour les fermer au logout) */
export const sessionChannel = (id: string) => `session:${id}`;
