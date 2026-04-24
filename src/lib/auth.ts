import bcrypt from "bcrypt";
import { createToken } from "@/lib/token";

export { createToken } from "@/lib/token";
export type { SessionUser } from "@/lib/token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}