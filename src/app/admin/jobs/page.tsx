import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import JobsClient from "./JobsClient";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Manage Jobs | Admin | SeraHub",
};

export const dynamic = "force-dynamic";

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/auth/login");

  const { q, status, category } = await searchParams;

  const where: Prisma.JobWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
    ...(status ? { status } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [jobs, categories] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    deadline: j.deadline?.toISOString() ?? null,
  }));

  return <JobsClient user={session} jobs={serialized} categories={categories} filters={{ q: q ?? "", status: status ?? "", category: category ?? "" }} />;
}