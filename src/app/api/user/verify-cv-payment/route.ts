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

    const { reference, cvAnalysisId } = await req.json();

    if (!reference || !cvAnalysisId) {
      return NextResponse.json({ error: "Missing reference or cvAnalysisId" }, { status: 400 });
    }

    const cvAnalysis = await prisma.cVAnalysis.findUnique({
      where: { id: cvAnalysisId, userId: session.id },
      include: { transaction: true }
    });

    if (!cvAnalysis) {
      return NextResponse.json({ error: "CV Analysis not found" }, { status: 404 });
    }

    if (cvAnalysis.transaction && cvAnalysis.transaction.status === "SUCCESS") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const siteConfig = await prisma.siteConfig.findUnique({ where: { key: "cvanalyzer_price_etb" } });
    const price = parseFloat(siteConfig?.value || "150");

    let transaction = cvAnalysis.transaction;

    // Create a new transaction if it doesn't exist
    if (!transaction) {
      transaction = await prisma.transaction.create({
        data: {
          userId: session.id,
          amount: price,
          reference: reference,
          purpose: "CV_ANALYSIS",
          status: "PENDING",
        }
      });

      // Link transaction to CVAnalysis
      await prisma.cVAnalysis.update({
        where: { id: cvAnalysis.id },
        data: { transactionId: transaction.id }
      });
    } else {
      // Update existing pending transaction with new reference
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { reference, status: "PENDING" }
      });
    }

    // Submit to Verifyet API
    // We pass the webhook URL dynamically based on the current host.
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
    console.error("[Verify CV Payment Error]", error);
    return NextResponse.json({ error: "Failed to process payment verification" }, { status: 500 });
  }
}
