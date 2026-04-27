import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | SeraHub",
};

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    jobCount,
    bidCount,
    categoryCount,
    userCount,
    subscriberCount,
    aiCallCount,
    publishedJobs,
    publishedBids,
    draftJobs,
    draftBids,
    recentJobs,
    recentBids,
    categoriesWithCounts,
    totalJobViews,
    totalBidViews,
    totalPageViews,
    pageViewsToday,
    pageViewsYesterday,
    pageViewsLast7Days,
    pageViewsLast30Days,
    uniqueVisitors7d,
    uniqueVisitors30d,
    topPages,
    dailyViews,
    monthlyJobs,
    monthlyBids,
    monthlySubscribers,
    topReferrers,
    totalEmailClicks,
    dailyEmailClicks
  ] = await Promise.all([
    prisma.job.count(),
    prisma.bid.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.subscriber.count(),
    prisma.aIUsage.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.bid.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.bid.count({ where: { status: "DRAFT" } }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.bid.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { jobs: true, bids: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.job.aggregate({ _sum: { views: true } }),
    prisma.bid.aggregate({ _sum: { views: true } }),
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: yesterday, lt: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { path: true },
    }).then((rows) => new Set(rows.map((r) => r.path)).size),
    prisma.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { path: true },
    }).then((rows) => new Set(rows.map((r) => r.path)).size),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    }),
    prisma.job.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: true,
    }),
    prisma.bid.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: true,
    }),
    prisma.subscriber.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: true,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { referrer: { not: "" } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 5,
    }),
    prisma.emailClick.count(),
    prisma.emailClick.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    }),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  type TimeRow = { createdAt: Date; _count: number };
  function buildMonthly(rows: TimeRow[]) {
    const map: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = 0;
    }
    for (const row of rows) {
      const d = new Date(row.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in map) map[key] = (map[key] || 0) + row._count;
    }
    return Object.entries(map).map(([key, count]) => {
      const [, m] = key.split("-").map(Number);
      return { month: monthNames[m - 1], count };
    });
  }

  const jobsMonthly = buildMonthly(monthlyJobs as TimeRow[]);
  const bidsMonthly = buildMonthly(monthlyBids as TimeRow[]);
  const subsMonthly = buildMonthly(monthlySubscribers as TimeRow[]);

  const trendData = jobsMonthly.map((j, i) => ({
    month: j.month,
    jobs: j.count,
    bids: bidsMonthly[i].count,
    subscribers: subsMonthly[i].count,
  }));

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7 = new Array(7).fill(0);
  for (const row of dailyViews as TimeRow[]) {
    const d = new Date(row.createdAt);
    const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (daysAgo >= 0 && daysAgo < 7) {
      last7[6 - daysAgo] += row._count;
    }
  }

  const last7Emails = new Array(7).fill(0);
  for (const row of dailyEmailClicks as TimeRow[]) {
    const d = new Date(row.createdAt);
    const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (daysAgo >= 0 && daysAgo < 7) {
      last7Emails[6 - daysAgo] += row._count;
    }
  }

  const dailyViewsData = last7.map((count, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return { day: dayLabels[d.getDay()], views: count, emailClicks: last7Emails[i] };
  });

  const topPagesData = topPages.map((p) => ({
    path: p.path,
    views: p._count.path,
  }));

  const topReferrersData = topReferrers.map((r) => {
    let domain = r.referrer;
    try { domain = new URL(r.referrer).hostname; } catch { /* keep original */ }
    return { referrer: domain, visits: r._count.referrer };
  });

  return (
    <AdminDashboard
      user={session}
      stats={{ jobCount, bidCount, categoryCount, userCount, subscriberCount, aiCallCount, publishedJobs, publishedBids, draftJobs, draftBids, totalEmailClicks }}
      totalViews={(totalJobViews._sum.views ?? 0) + (totalBidViews._sum.views ?? 0)}
      visitorStats={{
        totalPageViews: totalPageViews,
        pageViewsToday: pageViewsToday,
        pageViewsYesterday: pageViewsYesterday,
        pageViewsLast7Days: pageViewsLast7Days,
        pageViewsLast30Days: pageViewsLast30Days,
        uniqueVisitors7d: uniqueVisitors7d,
        uniqueVisitors30d: uniqueVisitors30d,
      }}
      recentJobs={recentJobs.map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        source: j.source || "N/A",
        category: j.category?.name || null,
        views: j.views,
        status: j.status,
        createdAt: j.createdAt.toISOString(),
      }))}
      recentBids={recentBids.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        source: b.source || "N/A",
        views: b.views,
        status: b.status,
        deadline: b.deadline?.toISOString() || null,
        createdAt: b.createdAt.toISOString(),
      }))}
      categoryData={categoriesWithCounts.map((c) => ({
        name: c.name,
        jobs: c._count.jobs,
        bids: c._count.bids,
      }))}
      trendData={trendData}
      dailyViewsData={dailyViewsData}
      topPagesData={topPagesData}
      topReferrersData={topReferrersData}
    />
  );
}