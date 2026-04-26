"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteConfig.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  for (const key of keys) {
    if (!(key in map)) map[key] = "";
  }
  return map;
}

export async function updateSettingsAction(formData: FormData) {
  const entries = Array.from(formData.entries());
  for (const [key, value] of entries) {
    if (typeof key !== "string") continue;
    const strVal = (value as string) ?? "";
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value: strVal },
      create: { key, value: strVal },
    });
  }
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function resetViewsAction() {
  await Promise.all([
    prisma.job.updateMany({ data: { views: 0 } }),
    prisma.bid.updateMany({ data: { views: 0 } }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteDraftsAction() {
  await prisma.bookmark.deleteMany({ where: { job: { status: "DRAFT" } } });
  await prisma.bookmark.deleteMany({ where: { bid: { status: "DRAFT" } } });
  const [deletedJobs, deletedBids] = await Promise.all([
    prisma.job.deleteMany({ where: { status: "DRAFT" } }),
    prisma.bid.deleteMany({ where: { status: "DRAFT" } }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/bids");
  revalidatePath("/admin/settings");
  return { success: true, deletedJobs: deletedJobs.count, deletedBids: deletedBids.count };
}

export async function testSmtpAction(email: string) {
  if (!email) return { error: "Email is required for testing." };
  try {
    const { sendMail } = await import("@/lib/mail");
    await sendMail({
      to: email,
      subject: "SeraHub - SMTP Test Connection",
      text: "This is a test email to verify your SMTP configuration is working correctly.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00c087;">SMTP Test Successful!</h2>
          <p>Your SMTP configuration is working perfectly. You can now use this service for sending OTPs, newsletters, and system notifications.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated test message from your SeraHub Admin Panel.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return { error: error.message || "Failed to connect to SMTP server. Check your host, port, and credentials." };
  }
}