import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import { hashPassword, verifyPassword } from "../../../utils/password";
import { sessionService } from "../../../services/session.service";
import { session } from "../../../config/session";
import {
  SESSION_COOKIE,
  sessionCOokieOptions,
} from "../../../utils/cookies.util";

const COOKIE_SECURE = process.env.NODE_ENV === "producion";

async function openSession(res: Response, userId: string) {
  const token = await session.open(userId);

  res.cookie(
    SESSION_COOKIE,
    token,
    sessionCOokieOptions(COOKIE_SECURE, session.ttlMs),
  );
}

export const register = async (req: Request, res: Response) => {
  const { phone, name, password } = req.body;
  const phoneUser = await prisma.user.findFirst({
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

  const verifyUser = await prisma.user.findFirst({
    where: { phone },
  });

  const DUMMY_HASH = await hashPassword(crypto.randomUUID());

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
  // Ouverture de la sessio
  await openSession(res, verifyUser.id);
  return res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: verifyUser.id,
      name: verifyUser.name,
      phone: verifyUser.phone,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  if (!req.headers.cookie) {
    return;
  }

  await session.revoke(req.headers.cookie);
  res.clearCookie(SESSION_COOKIE, sessionCOokieOptions(COOKIE_SECURE));

  return res.status(204).end();
};

export const me = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "user retrived",
    user: res.locals.user,
  });
};
