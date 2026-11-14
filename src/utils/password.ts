import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

/**
 * Empreinte factice calculee UNE SEULE FOIS au demarrage : on la compare quand
 * le numero n'existe pas, pour que le temps de reponse ne revele rien.
 */
export const DUMMY_HASH = bcrypt.hashSync("dummy-password-never-used", ROUNDS);

export async function verifyPassword(password: string, hash: string) {
  try {
    // le await est necessaire pour que le catch attrape un rejet de la promesse
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
