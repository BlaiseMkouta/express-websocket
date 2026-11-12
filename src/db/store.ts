import { setEngine } from "node:crypto";
import prisma from "../config/prisma";

export interface StoredUser {
  phone: string[];
}

export interface Store {
  createSession(id: string, userId: string, expiredAt: Date): Promise<void>;
  findSession(id: string): Promise<StoredUser | null>;
  deleteSession(id: string): Promise<void>;
}

export function PrismaStore() {
  return {
    async createSession(id: string, userId: string, expiredAt: string) {
      await prisma.session.create({
        data: {
          id,
          userId,
          expiredAt,
        },
      });
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
