"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { generateNewsletter } from "@/lib/ai";

export async function subscribeAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return { error: "You're already subscribed!" };
  }

  await prisma.subscriber.create({ data: { email } });

  // Send Welcome Email
  try {
    const configRows = await prisma.siteConfig.findMany();
    const config = configRows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const welcomeSubject = `Welcome to ${config.site_name || "SeraHub"}!`;
    const welcomeHtml = `
      <div style="text-align: center; padding: 20px 0;">
        <h2 style="color: #00c087; font-size: 24px; margin-bottom: 16px;">You're officially on the list!</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          Thank you for subscribing to <strong>${config.site_name || "SeraHub"}</strong>. 
          You'll now be the first to know about the best job opportunities and bid announcements in Ethiopia, curated by our smart engine.
        </p>
        <div style="margin: 32px 0;">
          <a href="${config.appearance_site_url || "https://serahub.click"}" 
             style="display: inline-block; background: linear-gradient(105deg, #047857, #059669); color: #ffffff; padding: 14px 32px; border-radius: 60px; font-weight: 700; font-size: 15px; text-decoration: none;">
            Explore Latest Jobs
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
          We're excited to help you find your next big opportunity!
        </p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: welcomeSubject,
      text: `Welcome to ${config.site_name || "SeraHub"}! We're glad to have you. Explore latest jobs at ${config.appearance_site_url || "https://serahub.click"}`,
      html: welcomeHtml
    });
  } catch (error) {
    console.error("[Welcome Email] Failed to send:", error);
  }

  revalidatePath("/admin/subscribers");
  return { success: true };
}

export async function deleteSubscriberAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.subscriber.delete({ where: { id } });
  revalidatePath("/admin/subscribers");
  return { success: true };
}

export async function triggerNewsletterAction() {
  try {
    // 1. Fetch subscribers
    const subscribers = await prisma.subscriber.findMany({ select: { email: true } });
    if (subscribers.length === 0) return { error: "No subscribers found." };

    // 2. Fetch jobs posted in the last 7 days that are not expired
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const jobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: "PUBLISHED",
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 10 // Only top 10 for newsletter
    });

    if (jobs.length === 0) return { error: "No new jobs found in the last 7 days." };

    // 3. Generate newsletter content with AI
    const siteUrl = (await prisma.siteConfig.findUnique({ where: { key: "appearance_site_url" } }))?.value || "https://serahub.click";
    const newsletterJobs = jobs.map(j => {
      const jobUrl = `${siteUrl.replace(/\/$/, "")}/jobs/${j.slug}`;
      const trackingLink = `${siteUrl.replace(/\/$/, "")}/api/track?url=${encodeURIComponent(jobUrl)}&source=newsletter`;
      return {
        title: j.title,
        link: trackingLink,
        metaDescription: j.metaDescription ?? undefined
      };
    });

    const content = await generateNewsletter(newsletterJobs);
    if (!content) return { error: "Failed to generate newsletter with AI." };

    // 4. Send to all subscribers
    const results = await Promise.allSettled(
      subscribers.map(s => sendMail({
        to: s.email,
        subject: content.subject,
        text: "Please view this email in an HTML compatible mail client.",
        html: content.html
      }))
    );

    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failureCount = results.length - successCount;

    return { 
      success: true, 
      message: `Newsletter sent successfully to ${successCount} subscribers. ${failureCount > 0 ? `${failureCount} failed.` : ""}` 
    };
  } catch (error: any) {
    console.error("[Newsletter] Trigger Error:", error);
    return { error: error.message || "Failed to send newsletter." };
  }
}