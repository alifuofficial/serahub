import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/magic";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getSessionCookieName } from "@/lib/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?error=Invalid link", request.url));
  }

  const email = await verifyMagicToken(token);

  if (!email) {
    return NextResponse.redirect(new URL("/auth/login?error=Link expired or invalid", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true }
  });

  if (!user) {
    return NextResponse.redirect(new URL("/auth/register?email=" + encodeURIComponent(email), request.url));
  }

  // Create session
  const sessionToken = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
