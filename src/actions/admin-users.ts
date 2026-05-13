"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";
  const role = formData.get("role") as string || "USER";
  const subscriptionPlan = formData.get("subscriptionPlan") as string || "FREE";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const hashedPassword = await hashPassword(password);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        subscriptionPlan,
        emailVerified: new Date(), // Admin created users are verified by default
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("[Create User] Error:", error);
    return { error: "Failed to create user." };
  }
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const role = formData.get("role") as string || "USER";
  const subscriptionPlan = formData.get("subscriptionPlan") as string || "FREE";
  const password = formData.get("password") as string || "";

  if (!id || !email) {
    return { error: "User ID and email are required." };
  }

  const data: any = {
    name,
    email,
    role,
    subscriptionPlan,
  };

  if (password) {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }
    data.password = await hashPassword(password);
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });
    if (existing) {
      return { error: "Email already in use by another user." };
    }

    await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("[Update User] Error:", error);
    return { error: "Failed to update user." };
  }
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  if (!id) return { error: "User ID is required." };

  try {
    // Prevent deleting self
    const session = await requireAdmin(); // requireAdmin returns user if needed, but here we just need current session
    // Wait, requirement is usually to check against session ID. 
    // Let's get the session ID specifically.
    const { getSession } = await import("@/lib/session");
    const currentSession = await getSession();
    if (currentSession?.id === id) {
      return { error: "You cannot delete your own account." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("[Delete User] Error:", error);
    return { error: "Failed to delete user." };
  }
}
