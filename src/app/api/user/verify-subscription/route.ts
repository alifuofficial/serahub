import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { submitVerification } from "@/lib/verifyet";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Find the latest pending subscription transaction for this user
    const transaction = await prisma.transaction.findFirst({
      where: { 
        userId: session.id, 
        status: "PENDING",
        purpose: { in: ["SUBSCRIPTION_PRO_JOB", "SUBSCRIPTION_PRO_BID"] }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!transaction) {
      return NextResponse.json({ error: "No pending subscription found. Please select a plan first." }, { status: 404 });
    }

    // Update transaction with the user's payment reference
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { reference }
    });

    // Submit to Verifyet API
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const webhookUrl = `${protocol}://${host}/api/webhooks/verifyet`;

    try {
      const verifyResponse = await submitVerification({
        reference,
        webhookUrl
      });

      // Update Transaction with Request ID from Verifyet
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { verifyetReqId: verifyResponse.requestId }
      });

      return NextResponse.json({ success: true, requestId: verifyResponse.requestId });
    } catch (verifyError: any) {
      console.error("Verifyet API Error:", verifyError);
      return NextResponse.json({ error: "Failed to connect to verification server. Please try again later." }, { status: 502 });
    }

  } catch (error: any) {
    console.error("[Verify Subscription Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
