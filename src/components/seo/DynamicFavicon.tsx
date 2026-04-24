import { prisma } from "@/lib/prisma";

export default async function DynamicFavicon() {
  const row = await prisma.siteConfig.findUnique({ where: { key: "appearance_favicon_url" } });
  const faviconUrl = row?.value;
  if (!faviconUrl) return null;
  return <link rel="icon" href={faviconUrl} />;
}