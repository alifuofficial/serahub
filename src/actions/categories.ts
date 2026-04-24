"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCategoryAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();
    if (!name) return { error: "Name is required." };

    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return { error: "Category already exists." };

    await prisma.category.create({ data: { name, slug } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category. Please try again." };
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}