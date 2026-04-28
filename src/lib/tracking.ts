import { prisma } from "./prisma";
import { getSession } from "./session";

export async function trackUserAction(type: "SEARCH" | "VIEW" | "BOOKMARK", value: string, email?: string) {
  try {
    const session = await getSession();
    const userId = session?.id;

    await prisma.userInteraction.create({
      data: {
        userId: userId || null,
        email: email || null,
        type,
        value,
      }
    });
  } catch (error) {
    console.error("[Tracking] Error logging interaction:", error);
  }
}
