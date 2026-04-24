import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AdSenseScript from "@/components/ads/AdSenseScript";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import DynamicFavicon from "@/components/seo/DynamicFavicon";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://serahub.com";

export const viewport: Viewport = {
  themeColor: "#00c087",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SeraHub | Job & Bid Aggregator",
    template: "%s | SeraHub",
  },
  description: "Discover the latest jobs, bids, and tender opportunities. SeraHub connects you with top companies and talented professionals in Ethiopia and beyond.",
  keywords: ["jobs", "bids", "tenders", "Ethiopia", "opportunities", "careers", "freelance", "contract", "procurement", "vacancies"],
  authors: [{ name: "SeraHub" }],
  creator: "SeraHub",
  publisher: "SeraHub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "SeraHub",
    title: "SeraHub | Job & Bid Aggregator",
    description: "Discover the latest jobs, bids, and tender opportunities. SeraHub connects you with top companies and talented professionals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeraHub - Job & Bid Aggregator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeraHub | Job & Bid Aggregator",
    description: "Discover the latest jobs, bids, and tender opportunities.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
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
        <DynamicFavicon />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}