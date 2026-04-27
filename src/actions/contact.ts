"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function submitContactAction(formData: FormData) {
  // Honeypot check
  if (formData.get("hp_phone")) {
    return { error: "Spam detected." };
  }

  const limiter = await rateLimit(2, 60000); // 2 messages per minute
  if (!limiter.success) return { error: "Too many messages. Please try again later." };

  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const subject = (formData.get("subject") as string || "").trim();
  const message = (formData.get("message") as string || "").trim();

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }

  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  return { success: true };
}

export async function markMessageReadAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  return { success: true };
}

export async function deleteMessageAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.contactMessage.delete({ where: { id } });
  return { success: true };
}