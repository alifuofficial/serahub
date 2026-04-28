import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = (formData.get("email") as string || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const referer = request.headers.get("referer") || request.nextUrl.origin + "/";
      const redirectUrl = new URL(referer);
      redirectUrl.searchParams.set("subscribe_error", "invalid_email");
      return NextResponse.redirect(redirectUrl.toString());
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });
    
    if (!existing) {
      await prisma.subscriber.create({ data: { email } });
      revalidatePath("/admin/subscribers");
    }

    // Redirect back to the referrer with a success message
    const referer = request.headers.get("referer") || request.nextUrl.origin + "/";
    const redirectUrl = new URL(referer);
    redirectUrl.searchParams.set("subscribed", "true");
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Subscription error:", error);
    const referer = request.headers.get("referer") || request.nextUrl.origin + "/";
    const redirectUrl = new URL(referer);
    redirectUrl.searchParams.set("subscribe_error", "server_error");
    return NextResponse.redirect(redirectUrl.toString());
  }
}
