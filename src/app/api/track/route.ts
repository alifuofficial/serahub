import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : "";
    const country = typeof body.country === "string" ? body.country.slice(0, 100) : "";

    await prisma.pageView.create({
      data: { path, referrer, country },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const source = searchParams.get("source") || "newsletter";

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    await prisma.emailClick.create({
      data: {
        url,
        source,
      },
    });
  } catch (error) {
    console.error("[EmailClick Tracking Error]", error);
  }

  return NextResponse.redirect(url);
}