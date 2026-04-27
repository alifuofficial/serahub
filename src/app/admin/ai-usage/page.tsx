import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AIUsageClient from "./AIUsageClient";

export default async function AIUsagePage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [logs, statsRaw] = await Promise.all([
    prisma.aIUsage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.aIUsage.findMany({
      select: {
        provider: true,
        type: true,
        status: true,
        createdAt: true
      }
    })
  ]);

  // Aggregate Stats
  const totalCalls = statsRaw.length;
  const successCount = statsRaw.filter(l => l.status === "SUCCESS").length;
  const errorCount = totalCalls - successCount;

  const typeCounts: Record<string, number> = {};
  const providerCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  statsRaw.forEach(log => {
    typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    providerCounts[log.provider] = (providerCounts[log.provider] || 0) + 1;
    
    const day = log.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  const typeBreakdown = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const providerBreakdown = Object.entries(providerCounts)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count);

  // Get last 7 days for chart
  const dailyUsage = Object.entries(dailyCounts)
    .map(([day, count]) => ({ day, count }))
    .slice(-7);

  return (
    <AIUsageClient 
      user={session} 
      logs={JSON.parse(JSON.stringify(logs))}
      stats={{
        totalCalls,
        successCount,
        errorCount,
        typeBreakdown,
        providerBreakdown,
        dailyUsage
      }}
    />
  );
}
