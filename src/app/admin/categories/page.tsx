import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = {
  title: "Categories | Admin | SeraHub",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/auth/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { jobs: true, bids: true } },
    },
  });

  const serialized = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: { jobs: c._count.jobs, bids: c._count.bids },
  }));

  return <CategoriesClient user={session} categories={serialized} />;
}