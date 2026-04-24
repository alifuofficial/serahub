import { prisma } from "@/lib/prisma";

export async function GoogleAnalytics() {
  const row = await prisma.siteConfig.findUnique({ where: { key: "seo_google_analytics" } });
  const gaId = row?.value || process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
    </>
  );
}