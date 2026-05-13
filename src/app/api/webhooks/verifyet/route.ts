import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifyet test webhook scenario
    if (body.scenario && body.webhookUrl) {
      console.log("[Verifyet Webhook] Received test ping payload.");
      return NextResponse.json({ success: true, message: "Test received" }, { status: 200 });
    }

    const { event, requestId, data } = body;

    if (!requestId || !event) {
      return NextResponse.json({ error: "Missing requestId or event" }, { status: 400 });
    }

    console.log(`[Verifyet Webhook] Received ${event} for requestId ${requestId}`, data);

    if (event === "verification.completed") {
      const transaction = await prisma.transaction.findUnique({
        where: { verifyetReqId: requestId },
      });

      if (!transaction) {
        console.warn(`[Verifyet Webhook] Transaction not found for requestId: ${requestId}`);
        return NextResponse.json({ success: true, warning: "Transaction not found" }, { status: 200 });
      }

      // Update the transaction status based on verification result
      let newStatus = transaction.status;
      
      if (data.status === "success" && data.verified === true) {
        newStatus = "SUCCESS";
      } else if (data.status === "failed" || data.status === "not_found") {
        newStatus = "FAILED";
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          bank: data.bank || transaction.bank,
          meta: JSON.stringify(body),
        },
      });

      console.log(`[Verifyet Webhook] Transaction ${transaction.id} updated to ${newStatus}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Verifyet Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
