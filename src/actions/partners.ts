"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPartners() {
  return await prisma.partner.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createPartner(formData: FormData) {
  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const website = formData.get("website") as string;
  const order = parseInt(formData.get("order") as string || "0");

  if (!name || !logoUrl) return { error: "Name and Logo URL are required" };

  try {
    // @ts-ignore
    if (!prisma.partner) {
      return { error: "Database not ready. Please restart the server." };
    }
    // @ts-ignore
    await prisma.partner.create({
      data: { name, logoUrl, website, order },
    });
    revalidatePath("/");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    console.error("Create Partner Error:", error);
    return { error: `Failed to create partner: ${error.message || "Unknown error"}` };
  }
}

export async function updatePartner(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const website = formData.get("website") as string;
  const order = parseInt(formData.get("order") as string || "0");
  const active = formData.get("active") === "true";

  try {
    // @ts-ignore
    if (!prisma.partner) {
      return { error: "Database not ready. Please restart the server." };
    }
    // @ts-ignore
    await prisma.partner.update({
      where: { id },
      data: { name, logoUrl, website, order, active },
    });
    revalidatePath("/");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    console.error("Update Partner Error:", error);
    return { error: `Failed to update partner: ${error.message || "Unknown error"}` };
  }
}

export async function deletePartner(id: string) {
  try {
    await prisma.partner.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete partner" };
  }
}
