import { PrismaStore } from "../db/store";
import { sessionService } from "../services/session.service";

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT secret key is required");
}

export const session = sessionService({
  store: PrismaStore(),
  secret,
  ttlMs: SESSION_TTL_MS,
});
