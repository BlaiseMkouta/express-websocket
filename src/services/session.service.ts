import { Store, StoredUser } from "../db/store";
import { readSessionToken } from "../utils/cookies.util";
import { signSessionToken, verifySessionToken } from "../utils/jwt.util";

export interface AuthenticatedSession {
  user: StoredUser;
  sessionId: string;
}

export interface SessionService {
  /** Duree de vie du token */
  ttlMs: number;
  /** Cree la session en base et renvoie le JWT a mettre dans le cookie */
  open(userId: string): Promise<string>;
  /** Verifie le cookie : signature du JWT, puis existence de la session en base */
  authenticated(
    cookieHeader: string | undefined,
  ): Promise<AuthenticatedSession | null>;
  /** Supprime la session du cookie ; renvoie son id (ou null) */
  revoke(cookieHeader: string | undefined): Promise<string | null>;
}

export function sessionService({
  store,
  secret,
  ttlMs,
}: {
  store: Store;
  secret: string;
  ttlMs: number;
}): SessionService {
  /**
   * Lis et verifie le token JWT du cookie (sans acces a la base)
   */
  function claimsToken(cookieHeader: string | undefined) {
    const token = readSessionToken(cookieHeader);
    return token ? verifySessionToken(token, secret) : null;
  }

  return {
    ttlMs,

    async authenticated(cookieHeader) {
      const verified = claimsToken(cookieHeader);
      if (!verified) return null;

      const user = await store.findSession(verified.sessionId);

      // la session doit exister ET appartenir au compte indique dans le jeton
      if (!user || user.id !== verified.userId) return null;

      return { sessionId: verified.sessionId, user };
    },

    async revoke(cookieHeader) {
      const verified = claimsToken(cookieHeader);
      if (!verified) return null;

      await store.deleteSession(verified.sessionId);

      return verified.sessionId;
    },

    async open(userId) {
      const expiredAt = new Date(Date.now() + ttlMs);

      // creation de la session
      const session = await store.createSession(userId, expiredAt);

      return signSessionToken(
        { userId, sessionId: session.id },
        secret,
        Math.floor(ttlMs / 1000),
      );
    },
  };
}
