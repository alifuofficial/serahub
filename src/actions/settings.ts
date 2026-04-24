"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteConfig.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  for (const key of keys) {
    if (!(key in map)) map[key] = "";
  }
  return map;
}

export async function updateSettingsAction(formData: FormData) {
  const entries = Array.from(formData.entries());
  for (const [key, value] of entries) {
    if (typeof key !== "string") continue;
    const strVal = (value as string) ?? "";
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value: strVal },
      create: { key, value: strVal },
    });
  }
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function resetViewsAction() {
  await Promise.all([
    prisma.job.updateMany({ data: { views: 0 } }),
    prisma.bid.updateMany({ data: { views: 0 } }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteDraftsAction() {
  await prisma.bookmark.deleteMany({ where: { job: { status: "DRAFT" } } });
  await prisma.bookmark.deleteMany({ where: { bid: { status: "DRAFT" } } });
  const [deletedJobs, deletedBids] = await Promise.all([
    prisma.job.deleteMany({ where: { status: "DRAFT" } }),
    prisma.bid.deleteMany({ where: { status: "DRAFT" } }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/bids");
  revalidatePath("/admin/settings");
  return { success: true, deletedJobs: deletedJobs.count, deletedBids: deletedBids.count };
}