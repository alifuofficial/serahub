import { cookies } from "next/headers";
import { verifyToken, getSessionCookieName, type SessionUser } from "@/lib/token";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}