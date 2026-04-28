"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { generateNewsletter, curatePersonalizedNewsletter } from "@/lib/ai";

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
      html: welcomeHtml,
      type: "TRANSACTIONAL"
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
    // 1. Fetch Recipients (Users and Subscribers)
    const [users, guestSubscribers] = await Promise.all([
      prisma.user.findMany({
        where: { newsletterFrequency: { not: "NONE" } },
        include: {
          preferredCategories: { include: { category: true } },
          interactions: { orderBy: { createdAt: "desc" }, take: 10 }
        }
      }),
      prisma.subscriber.findMany({
        where: { frequency: { not: "NONE" } }
      })
    ]);

    // 2. Fetch new content (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [jobs, bids] = await Promise.all([
      prisma.job.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: "PUBLISHED" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 15
      }),
      prisma.bid.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: "PUBLISHED" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 15
      })
    ]);

    if (jobs.length === 0 && bids.length === 0) {
      return { error: "No new content found to send." };
    }

    const siteUrl = (await prisma.siteConfig.findUnique({ where: { key: "appearance_site_url" } }))?.value || "https://serahub.click";
    
    // Prepare items for AI
    const allAvailableItems = [
      ...jobs.map(j => ({
        id: j.id,
        title: j.title,
        type: "JOB",
        category: j.category?.name,
        descriptionSnippet: j.metaDescription || j.description.substring(0, 150),
        link: `${siteUrl.replace(/\/$/, "")}/api/track?url=${encodeURIComponent(`${siteUrl.replace(/\/$/, "")}/jobs/${j.slug}`)}&source=newsletter`
      })),
      ...bids.map(b => ({
        id: b.id,
        title: b.title,
        type: "BID",
        category: b.category?.name,
        descriptionSnippet: b.metaDescription || b.description.substring(0, 150),
        link: `${siteUrl.replace(/\/$/, "")}/api/track?url=${encodeURIComponent(`${siteUrl.replace(/\/$/, "")}/bids/${b.slug}`)}&source=newsletter`
      }))
    ];

    let successCount = 0;
    let failureCount = 0;

    // 3. Process Users (Personalized)
    for (const user of users) {
      try {
        const content = await curatePersonalizedNewsletter(
          {
            name: user.name,
            email: user.email,
            interactions: user.interactions.map(i => ({ type: i.type, query: i.value, targetSlug: i.value })),
            preferredCategories: user.preferredCategories.map(pc => pc.category.name)
          },
          allAvailableItems
        );

        if (content) {
          await sendMail({
            to: user.email,
            subject: content.subject,
            text: "Personalized update from SeraHub",
            html: content.html,
            type: "NEWSLETTER"
          });
          await prisma.user.update({ where: { id: user.id }, data: { lastNewsletterAt: new Date() } });
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to send user newsletter to ${user.email}:`, err);
        failureCount++;
      }
    }

    // 4. Process Guest Subscribers (Standard AI Curation)
    // For guests, we use the simpler generateNewsletter or a generic curation
    const guestContent = await generateNewsletter(allAvailableItems.slice(0, 8)); // Just top 8 generic items
    if (guestContent) {
      for (const guest of guestSubscribers) {
        try {
          await sendMail({
            to: guest.email,
            subject: guestContent.subject,
            text: "Weekly update from SeraHub",
            html: guestContent.html,
            type: "NEWSLETTER"
          });
          await prisma.subscriber.update({ where: { id: guest.id }, data: { lastNewsletterAt: new Date() } });
          successCount++;
        } catch (err) {
          console.error(`Failed to send guest newsletter to ${guest.email}:`, err);
          failureCount++;
        }
      }
    }

    return { 
      success: true, 
      message: `Newsletter sent successfully to ${successCount} recipients. ${failureCount > 0 ? `${failureCount} failed.` : ""}` 
    };
  } catch (error: any) {
    console.error("[Newsletter] Trigger Error:", error);
    return { error: error.message || "Failed to send newsletter." };
  }
}