import { NextResponse } from "next/server";
import { triggerNewsletterAction } from "@/actions/subscribers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional: Check for a secret to prevent unauthorized calls
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // You can set a CRON_SECRET in your environment variables for better security
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await triggerNewsletterAction();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
