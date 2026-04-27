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