import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard | SeraHub",
};

export const dynamic = "force-dynamic";

const SETTING_KEYS = [
  "site_name",
  "site_description",
  "site_keywords",
  "seo_og_title",
  "seo_og_description",
  "seo_og_image",
  "seo_google_verification",
  "seo_google_analytics",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from",
  "smtp_secure",
  "ads_enabled",
  "ads_client_id",
  "auth_email_verification",
  "auth_forgot_password",
  "appearance_primary_color",
  "appearance_site_url",
  "appearance_logo_url",
  "appearance_dark_logo_url",
  "appearance_favicon_url",
  "registration_enabled",
  "ftp_enabled",
  "ftp_host",
  "ftp_port",
  "ftp_user",
  "ftp_pass",
  "ftp_root",
  "ftp_public_url",
  "ai_enabled",
  "ai_provider",
  "gemini_api_key",
  "deepseek_api_key",
  "qwen_api_key",
];

export default async function SettingsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [users, configRows] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.siteConfig.findMany({ where: { key: { in: SETTING_KEYS } } }),
  ]);

  const config: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    config[key] = "";
  }
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <SettingsClient user={session} users={serializedUsers} config={config} />;
}