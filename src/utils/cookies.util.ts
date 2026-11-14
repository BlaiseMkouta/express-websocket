import type { CookieOptions } from "express";
import { parseCookie } from "cookie";

export const SESSION_COOKIE = "APP_WEBSOCKET";

// options du cookie de session
// sameSite "lax" : "none" exige secure=true, sinon le navigateur rejette le cookie.
export const sessionCookieOptions = (
  secure: boolean,
  maxAgeMs?: number,
): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure,
  path: "/",
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export function readSessionToken(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return null;
  }

  return parseCookie(cookieHeader)[SESSION_COOKIE] ?? null;
}
