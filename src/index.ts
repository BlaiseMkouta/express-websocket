import "dotenv/config";

import app from "./app";
import prisma from "./config/prisma";
import { ROOMS } from "./config/room";
import { createServer } from "node:http";
import { createSocketServer } from "./socket";
import { session } from "./config/session";

const PORT = process.env.PORT ?? "3000";

const start = async () => {
  try {
    await prisma.$connect();
    console.log("connection a la BD reussie");

    // on recopie la liste des rooms dans le code et on stock dans le code
    // Upset - "cree le s'il n'existe pas sinon met le a jour"
    for (const room of ROOMS) {
      await prisma.room.upsert({
        where: { id: room.id },
        create: room,
        update: { name: room.name, description: room.description },
      });
    }

    // le app.listen sera remplacer pour construire un server hhtp et socket.io
    // app.listen(PORT, () => {
    //   console.log(`Our aplication is running on port ${PORT}`);
    // });

    const httpServer = createServer(app); // Permet a l'appp d'ecouter les requetes hhtp
    createSocketServer(httpServer, session); // Connexion au serveur socket.io

    httpServer.listen(PORT, () => {
      console.log(`Our application is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Starting failed", error);
    process.exit(1);
  }
};

start();
