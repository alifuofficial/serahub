import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerNewsletterAction } from "@/actions/subscribers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get config
  const configs = await prisma.siteConfig.findMany({
    where: { key: { in: ["newsletter_auto_enabled", "newsletter_cron_token"] } }
  });

  const configMap: Record<string, string> = {};
  configs.forEach(c => configMap[c.key] = c.value);

  // 2. Verify token
  const secretToken = configMap["newsletter_cron_token"];
  if (!secretToken || token !== secretToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 3. Check if enabled
  if (configMap["newsletter_auto_enabled"] !== "true") {
    return NextResponse.json({ message: "Automatic newsletter is disabled" }, { status: 200 });
  }

  // 4. Trigger newsletter
  // Since it's a server action, we can call it directly or extract the logic.
  // Calling the action directly is easiest.
  const result = await triggerNewsletterAction();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: result.message }, { status: 200 });
}
