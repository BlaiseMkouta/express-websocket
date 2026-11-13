import { setEngine } from "node:crypto";
import prisma from "../config/prisma";
import { session } from "../generated/prisma/client";

// export interface StoredUser {
//   phone: string[];
// }

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
}

export interface Store {
  createSession(userId: string, expiredAt: Date): Promise<session>;
  findSession(id: string): Promise<StoredUser | null>;
  deleteSession(id: string): Promise<void>;
}

export function PrismaStore() {
  return {
    async createSession(userId: string, expiredAt: Date) {
      const session = await prisma.session.create({
        data: {
          userId,
          expiredAt,
        },
      });
      return session;
    },

    async findSession(id: string) {
      const session = await prisma.session.findFirst({
        where: { id },
        include: { user: true },
      });

      if (!session) return null;

      return {
        id: session.user.id,
        name: session.user.name,
        phone: session.user.phone,
      };
    },

    async deleteSession(id: string) {
      await prisma.session.delete({
        where: { id },
      });
    },
  };
}
