import prisma from "../config/prisma";
import { session } from "../generated/prisma/client";

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
}

export interface Store {
  createSession(userId: string, expiredAt: Date): Promise<session>;
  /** Compte d'une session encore valide (existante ET non expiree), sinon null */
  findSession(id: string): Promise<StoredUser | null>;
  deleteSession(id: string): Promise<void>;
}

export function PrismaStore(): Store {
  return {
    async createSession(userId, expiredAt) {
      return prisma.session.create({
        data: {
          userId,
          expiredAt,
        },
      });
    },

    async findSession(id) {
      const session = await prisma.session.findUnique({
        where: { id },
        include: { user: true },
      });

      // session revoquee ou expiree => refusee
      if (!session || session.expiredAt.getTime() <= Date.now()) return null;

      return {
        id: session.user.id,
        name: session.user.name,
        phone: session.user.phone,
      };
    },

    async deleteSession(id) {
      // deleteMany ne leve pas d'erreur si la ligne n'existe deja plus
      await prisma.session.deleteMany({
        where: { id },
      });
    },
  };
}
