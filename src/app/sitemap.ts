import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const siteUrlConfig = await prisma.siteConfig.findUnique({ where: { key: "appearance_site_url" } });
    const baseUrl = (siteUrlConfig?.value || process.env.NEXT_PUBLIC_SITE_URL || "https://www.serahub.click").replace(/\/$/, "");

    const [jobs, bids, categories] = await Promise.all([
      prisma.job.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        take: 5000, // Safety limit
      }),
      prisma.bid.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        take: 5000, // Safety limit
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/bids`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const bidPages: MetadataRoute.Sitemap = bids.map((bid) => ({
      url: `${baseUrl}/bids/${bid.slug}`,
      lastModified: bid.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...jobPages, ...bidPages, ...categoryPages];
  } catch (error) {
    console.error("[Sitemap Error]", error);
    // Return at least the homepage if everything fails
    return [
      { url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.serahub.click", lastModified: new Date() }
    ];
  }
}