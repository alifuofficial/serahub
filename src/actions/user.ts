"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!email) return { error: "Email is required" };

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { name, email },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") return { error: "Email already in use" };
    return { error: "Failed to update profile" };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password: true },
    });

    if (!user || !user.password) return { error: "User not found" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return { error: "Incorrect current password" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err) {
    return { error: "Failed to update password" };
  }
}

export async function toggleBookmarkAction(type: "JOB" | "BID", id: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const userId = session.id;

  try {
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        jobId: type === "JOB" ? id : null,
        bidId: type === "BID" ? id : null,
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard");
      revalidatePath(type === "JOB" ? `/jobs/[slug]` : `/bids/[slug]`);
      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          jobId: type === "JOB" ? id : null,
          bidId: type === "BID" ? id : null,
        },
      });
      revalidatePath("/dashboard");
      revalidatePath(type === "JOB" ? `/jobs/[slug]` : `/bids/[slug]`);
      return { success: true, bookmarked: true };
    }
  } catch (err) {
    return { error: "Failed to toggle bookmark" };
  }
}

export async function removeBookmarkAction(bookmarkId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await prisma.bookmark.delete({
      where: { id: bookmarkId, userId: session.id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: "Failed to remove bookmark" };
  }
}

export async function updateNewsletterPreferencesAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const frequency = formData.get("frequency") as string;
  const categories = formData.getAll("categories") as string[];

  try {
    // 1. Update frequency
    await prisma.user.update({
      where: { id: session.id },
      data: { newsletterFrequency: frequency }
    });

    // 2. Update preferred categories
    // First, delete existing ones
    await prisma.userCategory.deleteMany({
      where: { userId: session.id }
    });

    // Then, create new ones
    if (categories.length > 0) {
      await prisma.userCategory.createMany({
        data: categories.map(catId => ({
          userId: session.id,
          categoryId: catId
        }))
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[Newsletter Settings] Update error:", err);
    return { error: "Failed to update preferences" };
  }
}
