"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function handleUnsubscribeAction(formData: FormData) {
  const email = formData.get("email") as string;
  const option = formData.get("option") as string; // SNOOZE, NONE

  if (!email) return { error: "Email is required." };

  try {
    const frequency = option === "SNOOZE" ? "WEEKLY" : "NONE";

    const [user, sub] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.subscriber.findUnique({ where: { email } })
    ]);

    const updates = [];
    if (user) {
      updates.push(prisma.user.update({
        where: { email },
        data: { newsletterFrequency: frequency }
      }));
    }
    if (sub) {
      updates.push(prisma.subscriber.update({
        where: { email },
        data: { frequency }
      }));
    }

    if (updates.length === 0) return { error: "Subscription not found." };

    await Promise.all(updates);
    
    return { success: true, frequency };
  } catch (error) {
    console.error("[Unsubscribe Action]", error);
    return { error: "Failed to update subscription." };
  }
}
