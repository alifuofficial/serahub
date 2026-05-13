import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const [user, allCategories, bookmarks, siteConfigs, cvAnalysis] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        newsletterFrequency: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
        trialUsed: true,
        preferredCategories: {
          select: { categoryId: true }
        }
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.bookmark.findMany({
      where: { userId: session.id },
      include: {
        job: {
          select: {
            title: true,
            slug: true,
            source: true,
            category: { select: { name: true } },
          },
        },
        bid: {
          select: {
            title: true,
            slug: true,
            source: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteConfig.findMany({
      where: { key: { in: [
        "cvanalyzer_enabled", 
        "cvanalyzer_price_etb", 
        "sub_pro_job_enabled",
        "sub_pro_job_price",
        "sub_pro_bid_enabled",
        "sub_pro_bid_price",
        "sub_trial_enabled",
        "sub_trial_days"
      ] } }
    }),
    prisma.cVAnalysis.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: { transaction: true }
    })
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  // Handle subscription expiration
  let currentPlan = user.subscriptionPlan;
  if (user.subscriptionPlan !== "FREE" && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: "FREE" }
    });
    currentPlan = "FREE";
  }

  // Convert dates and handle nulls for client component
  const formattedBookmarks = bookmarks.map((b) => ({
    id: b.id,
    createdAt: b.createdAt.toISOString(),
    job: b.job ? {
      title: b.job.title,
      slug: b.job.slug,
      source: b.job.source || "Direct",
      category: b.job.category ? { name: b.job.category.name } : undefined
    } : null,
    bid: b.bid ? {
      title: b.bid.title,
      slug: b.bid.slug,
      source: b.bid.source || "Direct",
      category: b.bid.category ? { name: b.bid.category.name } : undefined
    } : null,
  }));

  const config: Record<string, string> = {};
  siteConfigs.forEach(c => config[c.key] = c.value);

  const cvAnalyzerConfig = {
    enabled: config.cvanalyzer_enabled === "true",
    price: parseInt(config.cvanalyzer_price_etb || "150", 10)
  };

  const subConfig = {
    pro_job: { enabled: config.sub_pro_job_enabled === "true", price: parseInt(config.sub_pro_job_price || "150", 10) },
    pro_bid: { enabled: config.sub_pro_bid_enabled === "true", price: parseInt(config.sub_pro_bid_price || "500", 10) },
    trial: { enabled: config.sub_trial_enabled === "true", days: parseInt(config.sub_trial_days || "7", 10) }
  };

  const formattedCvAnalysis = cvAnalysis ? {
    id: cvAnalysis.id,
    fileName: cvAnalysis.fileName,
    status: cvAnalysis.status,
    skills: cvAnalysis.skills ? JSON.parse(cvAnalysis.skills) : [],
    experience: cvAnalysis.experience,
    matchedJobs: cvAnalysis.matchedJobs ? JSON.parse(cvAnalysis.matchedJobs) : [],
    transactionStatus: cvAnalysis.transaction?.status || "PENDING",
    createdAt: cvAnalysis.createdAt.toISOString()
  } : null;

  const formattedUser = {
    ...user,
    subscriptionPlan: currentPlan,
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || null
  };

  return (
    <DashboardClient 
      user={formattedUser as any} 
      bookmarks={formattedBookmarks} 
      allCategories={allCategories} 
      cvAnalyzerConfig={cvAnalyzerConfig}
      cvAnalysis={formattedCvAnalysis}
      subConfig={subConfig}
    />
  );
}
