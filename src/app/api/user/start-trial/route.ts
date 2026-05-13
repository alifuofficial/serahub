import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSiteConfig } from "@/lib/config";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const config = await getSiteConfig();
  const trialEnabled = config.sub_trial_enabled === "true";
  const trialDays = parseInt(config.sub_trial_days || "7");

  if (!trialEnabled) {
    return NextResponse.json({ error: "Free trials are currently disabled" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { trialUsed: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.trialUsed) {
    return NextResponse.json({ error: "You have already used your free trial" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + trialDays);

  await prisma.user.update({
    where: { id: session.id },
    data: {
      subscriptionPlan: "TRIAL",
      subscriptionExpiresAt: expiresAt,
      trialUsed: true
    }
  });

  return NextResponse.json({ success: true, expiresAt });
}
