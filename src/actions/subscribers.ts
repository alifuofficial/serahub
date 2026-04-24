"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function subscribeAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return { error: "You're already subscribed!" };
  }

  await prisma.subscriber.create({ data: { email } });
  revalidatePath("/admin/subscribers");
  return { success: true };
}

export async function deleteSubscriberAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.subscriber.delete({ where: { id } });
  revalidatePath("/admin/subscribers");
  return { success: true };
}