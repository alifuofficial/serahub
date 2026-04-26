import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrlConfig = await prisma.siteConfig.findUnique({ where: { key: "appearance_site_url" } });
  const baseUrl = (siteUrlConfig?.value || process.env.NEXT_PUBLIC_SITE_URL || "https://www.serahub.click").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}