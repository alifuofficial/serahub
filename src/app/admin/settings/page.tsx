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
  "maintenance_enabled",
  "maintenance_title",
  "maintenance_message",
  "social_google_enabled",
  "social_google_client_id",
  "social_google_client_secret",
  "social_facebook_enabled",
  "social_facebook_app_id",
  "social_facebook_app_secret",
  "social_linkedin_enabled",
  "social_linkedin_client_id",
  "social_linkedin_client_secret",
  "social_link_facebook",
  "social_link_instagram",
  "social_link_tiktok",
  "social_link_linkedin",
  "social_link_telegram",
  "social_link_youtube",
  "jobs_enabled",
  "bids_enabled",
  "coming_soon_enabled",
  "coming_soon_title",
  "coming_soon_message",
];

export default async function SettingsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const configRows = await prisma.siteConfig.findMany({ where: { key: { in: SETTING_KEYS } } });

  const config: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    config[key] = "";
  }
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  return <SettingsClient user={session} config={config} />;
}