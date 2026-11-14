import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import {
  DUMMY_HASH,
  hashPassword,
  verifyPassword,
} from "../../../utils/password";
import { session } from "../../../config/session";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
} from "../../../utils/cookies.util";

const COOKIE_SECURE = process.env.NODE_ENV === "production";

async function openSession(res: Response, userId: string) {
  const token = await session.open(userId);

  res.cookie(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(COOKIE_SECURE, session.ttlMs),
  );
}

export const register = async (req: Request, res: Response) => {
  const { phone, name, password } = req.body;
  const phoneUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (phoneUser) {
    return res.status(409).json({
      success: false,
      message: "user with this phone number already exist",
    });
  }

  const user = await prisma.user.create({
    data: {
      phone,
      name,
      passwordHash: await hashPassword(password),
    },
  });

  await openSession(res, user.id);

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  const verifyUser = await prisma.user.findUnique({
    where: { phone },
  });

  // On verifie toujours un mot de passe, meme pour un numero inconnu :
  // le temps de reponse ne revele pas quels numeros ont un compte.
  const valid = await verifyPassword(
    password,
    verifyUser?.passwordHash ?? DUMMY_HASH,
  );

  if (!valid || !verifyUser) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Ouverture de la session
  await openSession(res, verifyUser.id);
  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: verifyUser.id,
      name: verifyUser.name,
      phone: verifyUser.phone,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  // revoke renvoie null s'il n'y a pas de cookie valide : on repond quand meme
  await session.revoke(req.headers.cookie);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions(COOKIE_SECURE));

  return res.status(204).end();
};

export const me = async (_req: Request, res: Response) => {
  res.set("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    message: "user retrieved",
    user: res.locals.user,
  });
};
