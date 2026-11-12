import type { CookieOptions } from "express";
import { parseCookie } from "cookie";

const SESSION_COOKIE = "APP_WEBSOCKET";

// options du cookies de session
export const sessionCOokieOptions = (
  secure: boolean,
  maxAgeMs?: number,
): CookieOptions => ({
  httpOnly: true,
  sameSite: "none", // "lax" en production
  secure,
  path: "/",
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export function readSessionToken(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return null;
  }

  const token = parseCookie(cookieHeader)[SESSION_COOKIE];
  return token;
}
