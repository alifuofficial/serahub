import { prisma } from "./prisma";
import crypto from "crypto";

/**
 * Creates a secure magic token for passwordless login.
 * Valid for 24 hours.
 */
export async function createMagicToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.magicToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verifies a magic token and returns the associated email if valid.
 * Deletes the token after use.
 */
export async function verifyMagicToken(token: string) {
  const magicToken = await prisma.magicToken.findUnique({
    where: { token },
  });

  if (!magicToken || magicToken.expiresAt < new Date()) {
    return null;
  }

  // Delete after use
  await prisma.magicToken.delete({ where: { id: magicToken.id } });

  return magicToken.email;
}
