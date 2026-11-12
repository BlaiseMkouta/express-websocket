import { Store } from "../db/store";
import { readSessionToken } from "../utils/cookies.util";
import { verifySessionToken } from "../utils/jwt.util";

type User = {
  id: string;
  name: string;
  phone: string;
};

export interface AuthenticatedSession {
  user: User;
  sessionId: string;
}

export interface SessionService {
  /** Duree de vie du token */
  ttlMs: number;

  authenticated(
    cookieHeader: string | undefined,
  ): Promise<AuthenticatedSession | null>;
}

export function sessionService({
  store,
  secret,
  ttlMs,
}: {
  store: Store;
  secret: string;
  ttlMs: number;
}) {
  /**
   *
   * Lis et verifie le token JWT du cookie
   */
  function claimsToken(cookieHeader: string | undefined) {
    const token = readSessionToken(cookieHeader);

    if (!token) {
      throw new Error("Token is required");
    }

    const verifiedToken = verifySessionToken(token, secret);

    if (!verifiedToken) return null;

    return verifiedToken;
  }

  return {
    ttlMs,

    async authenticated(cookieHeader: string) {
      const verified = claimsToken(cookieHeader);

      if (!verified) return null;

      const user = await store.findSession(verified.sessionId);

      if (!user) return null;

      return { sessionId: verified.sessionId, user };
    },

    async revoke(cookieHeader: string) {
      const verified = claimsToken(cookieHeader);

      if (!verified) return null;

      await store.deleteSession(verified.sessionId);

      return verified.sessionId;
    },
  };
}

// export const authenticated = (cookieHeader) => {};
