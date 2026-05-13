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
      where: { key: { in: ["cvanalyzer_enabled", "cvanalyzer_price_etb"] } }
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

  return (
    <DashboardClient 
      user={user as any} 
      bookmarks={formattedBookmarks} 
      allCategories={allCategories} 
      cvAnalyzerConfig={cvAnalyzerConfig}
      cvAnalysis={formattedCvAnalysis}
    />
  );
}
