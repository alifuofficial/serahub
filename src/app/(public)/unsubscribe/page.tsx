import { Metadata } from "next";
import UnsubscribeClient from "./UnsubscribeClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Manage Subscriptions | SeraHub",
};

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;

  // Get current status if email provided
  let currentStatus = "NONE";
  if (email) {
    const [user, sub] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { newsletterFrequency: true } }),
      prisma.subscriber.findUnique({ where: { email }, select: { frequency: true } })
    ]);
    currentStatus = user?.newsletterFrequency || sub?.frequency || "NONE";
  }

  return <UnsubscribeClient email={email} currentStatus={currentStatus} />;
}
