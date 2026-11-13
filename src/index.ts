import "dotenv/config";

import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT ?? "3000";

const start = async () => {
  try {
    await prisma.$connect();
    console.log("connection a la BD reussie");

    app.listen(PORT, () => {
      console.log(`Our aplication is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Starting failed", error);
    process.exit(1);
  }
};

start();
