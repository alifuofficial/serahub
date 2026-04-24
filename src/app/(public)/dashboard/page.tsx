import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
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
  });

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

  return <DashboardClient user={user} bookmarks={formattedBookmarks} />;
}
