import jwt from "jsonwebtoken";

// defini  le proprietaire de l'application
const ISSUER = "APP_WEBSOCKET";

// ALgorithme d'encryption
const ALGORITHM = "HS256";

// ce que contient le token valide
export interface SessionClaims {
  userId: string;
  sessionId: string;
}

/**
 * signe un token valide
 * @returns son contenu
 */
export function signSessionToken(
  { userId, sessionId }: SessionClaims,
  secret: string,
  expiresIn: number,
): string {
  return jwt.sign({ sid: sessionId }, secret, {
    subject: userId,
    issuer: ISSUER,
    algorithm: ALGORITHM,
    expiresIn: expiresIn,
  });
}

export function verifySessionToken(
  token: string,
  secret: string,
): SessionClaims | null {
  try {
    const payload = jwt.verify(token, secret, {
      issuer: ISSUER,
      algorithms: [ALGORITHM],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.sid !== "string"
    ) {
      return null;
    }

    return { userId: payload.sub, sessionId: payload.sid };
  } catch (error) {
    // session expirer, signature inconnue etc...
    return null;
  }
}
