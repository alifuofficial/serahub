"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, createToken } from "@/lib/auth";
import { getSessionCookieName } from "@/lib/token";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return { error: "Invalid email or password." };
  }

  const emailVerification = await prisma.siteConfig.findUnique({ where: { key: "auth_email_verification" } });
  if (emailVerification?.value === "true" && !user.emailVerified) {
    await sendOtpAction(email);
    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  }
  redirect("/");
}

export async function registerAction(formData: FormData) {
  const registrationEnabled = await prisma.siteConfig.findUnique({ where: { key: "registration_enabled" } });
  if (registrationEnabled && registrationEnabled.value === "false") {
    return { error: "Registration is currently disabled. Please contact the administrator." };
  }

  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });

  const emailVerification = await prisma.siteConfig.findUnique({ where: { key: "auth_email_verification" } });
  if (emailVerification?.value === "true") {
    await sendOtpAction(email);
    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
  redirect("/auth/login");
}

export async function sendOtpAction(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpToken.deleteMany({ where: { email } });
  await prisma.otpToken.create({ data: { email, code, expiresAt } });

  try {
    const { sendMail } = await import("@/lib/mail");
    await sendMail({
      to: email,
      subject: "SeraHub - Verification Code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #00c087;">Verify Your Email</h2>
          <p>Please use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">${code}</div>
          <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Send OTP Error:", error);
    return { error: "Failed to send verification email. Please check your SMTP settings." };
  }
}

export async function verifyOtpAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const code = (formData.get("code") as string || "").trim();

  if (!email || !code) return { error: "Email and code are required." };

  const otp = await prisma.otpToken.findFirst({
    where: { email, code, expiresAt: { gt: new Date() } }
  });

  if (!otp) return { error: "Invalid or expired verification code." };

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });

  await prisma.otpToken.delete({ where: { id: otp.id } });

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

export async function forgotPasswordAction(formData: FormData) {
  const enabled = await prisma.siteConfig.findUnique({ where: { key: "auth_forgot_password" } });
  if (enabled?.value === "false") {
    return { error: "Password reset is currently disabled. Please contact support." };
  }

  const email = (formData.get("email") as string || "").trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

  await prisma.otpToken.deleteMany({ where: { email } });
  await prisma.otpToken.create({ data: { email, code, expiresAt } });

  try {
    const { sendMail } = await import("@/lib/mail");
    await sendMail({
      to: email,
      subject: "SeraHub - Password Reset Code",
      text: `Your password reset code is ${code}. It expires in 20 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #00c087;">Password Reset</h2>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 30px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">${code}</div>
          <p style="font-size: 14px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { error: "Failed to send reset email." };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const code = (formData.get("code") as string || "").trim();
  const password = formData.get("password") as string || "";

  if (!email || !code || !password) return { error: "All fields are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const otp = await prisma.otpToken.findFirst({
    where: { email, code, expiresAt: { gt: new Date() } }
  });

  if (!otp) return { error: "Invalid or expired reset code." };

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  await prisma.otpToken.delete({ where: { id: otp.id } });

  return { success: true };
}