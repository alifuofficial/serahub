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

export async function testFtpAction() {
  const configRows = await prisma.siteConfig.findMany({
    where: { key: { in: ["ftp_host", "ftp_port", "ftp_user", "ftp_pass", "ftp_root", "ftp_public_url"] } }
  });
  const config: Record<string, string> = {};
  configRows.forEach(row => config[row.key] = row.value);

  if (!config.ftp_host || !config.ftp_user || !config.ftp_pass) {
    return { error: "FTP Host, User, and Password are required for testing." };
  }

  const ftp = await import("basic-ftp");
  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  try {
    await client.access({
      host: config.ftp_host,
      port: parseInt(config.ftp_port || "21"),
      user: config.ftp_user,
      password: config.ftp_pass,
      secure: false
    });

    const initialDir = await client.pwd();
    const remoteRoot = config.ftp_root || "/";
    await client.ensureDir(remoteRoot);
    
    const uniqueName = `test-connection-${Date.now()}.txt`;
    const remotePath = (remoteRoot.endsWith("/") ? remoteRoot : remoteRoot + "/") + uniqueName;
    
    // Create a simple text stream for the test file
    const stream = new (require("stream").Readable)();
    stream.push("SeraHub FTP Connection Test\nStatus: Successful\nInitial PWD: " + initialDir + "\nTarget Path: " + remotePath + "\nTime: " + new Date().toISOString());
    stream.push(null);

    await client.uploadFrom(stream, remotePath);
    await client.close();

    const publicUrl = config.ftp_public_url?.trim().replace(/\/$/, "") || "";
    const fullUrl = publicUrl ? `${publicUrl}/${uniqueName}` : null;

    return { 
      success: true, 
      url: fullUrl,
      msg: `FTP Connected. Starting dir: "${initialDir}". Test file uploaded to: "${remotePath}". ` + (fullUrl ? "Please verify the link below." : "")
    };
  } catch (err: any) {
    console.error("FTP Test Error:", err);
    client.close();
    return { error: `FTP Test failed: ${err.message}` };
  }
}