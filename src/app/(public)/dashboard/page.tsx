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

  // Convert dates to strings for client component
  const formattedBookmarks = bookmarks.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  return <DashboardClient user={user} bookmarks={formattedBookmarks} />;
}
