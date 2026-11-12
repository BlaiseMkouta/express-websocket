import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  try {
    return bcrypt.hash(password, hash);
  } catch (error) {
    return false;
  }
}

