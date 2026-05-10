import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AdSenseScript from "@/components/ads/AdSenseScript";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { prisma } from "@/lib/prisma";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://serahub.click";

export async function generateMetadata(): Promise<Metadata> {
  const settings: Record<string, string> = {};
  
  try {
    const config = await prisma.siteConfig.findMany({
      where: {
        key: { in: ["site_name", "site_description", "site_keywords", "appearance_favicon_url"] }
      }
    });
    config.forEach((row: any) => settings[row.key] = row.value);
  } catch (error) {
    console.warn("[Metadata] Database not ready, using defaults.");
  }

  const siteName = settings.site_name || "SeraHub";
  const siteDescription = settings.site_description || "Discover the latest jobs, bids, and tender opportunities.";
  const favicon = settings.appearance_favicon_url || "/favicon.ico";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} | Job & Bid Aggregator`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: settings.site_keywords?.split(",").map(k => k.trim()) || ["jobs", "bids", "tenders", "Ethiopia"],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: siteName,
      title: `${siteName} | Job & Bid Aggregator`,
      description: siteDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${siteName} - Job & Bid Aggregator`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Job & Bid Aggregator`,
      description: siteDescription,
      images: ["/og-image.png"],
    },
  };
}


export const viewport: Viewport = {
  themeColor: "#00c087",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <head>
        <AdSenseScript />
        <GoogleAnalytics />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}