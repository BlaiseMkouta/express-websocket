import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import { hashPassword, verifyPassword } from "../../../utils/password";
import { sessionService } from "../../../services/session.service";

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

  return;
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
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
  // Ouverture de la session
  return;
};


// export const logout = async (req: Request, res: Response) => {
    
// }