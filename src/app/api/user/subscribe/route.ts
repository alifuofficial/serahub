import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getSiteConfig } from "@/lib/config";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plan } = await req.json(); // "PRO_JOB" or "PRO_BID"
  if (plan !== "PRO_JOB" && plan !== "PRO_BID") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const config = await getSiteConfig();
  const enabled = plan === "PRO_JOB" ? config.sub_pro_job_enabled === "true" : config.sub_pro_bid_enabled === "true";
  const price = plan === "PRO_JOB" ? parseFloat(config.sub_pro_job_price || "150") : parseFloat(config.sub_pro_bid_price || "500");

  if (!enabled) {
    return NextResponse.json({ error: "This plan is currently disabled" }, { status: 400 });
  }

  // Create a pending transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: session.id,
      amount: price,
      currency: "ETB",
      purpose: plan === "PRO_JOB" ? "SUBSCRIPTION_PRO_JOB" : "SUBSCRIPTION_PRO_BID",
      status: "PENDING",
      reference: `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
  });

  return NextResponse.json({ 
    success: true, 
    transactionId: transaction.id,
    amount: price,
    reference: transaction.reference
  });
}
