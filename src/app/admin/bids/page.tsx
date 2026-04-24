import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import BidsClient from "./BidsClient";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Manage Bids | Admin | SeraHub",
};

export const dynamic = "force-dynamic";

export default async function AdminBidsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/auth/login");

  const { q, status, category } = await searchParams;

  const where: Prisma.BidWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
    ...(status ? { status } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [bids, categories] = await Promise.all([
    prisma.bid.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } }, files: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = bids.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    deadline: b.deadline?.toISOString() ?? null,
    files: b.files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
  }));

  return <BidsClient user={session} bids={serialized} categories={categories} filters={{ q: q ?? "", status: status ?? "", category: category ?? "" }} />;
}