import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

const SETTING_KEYS = [
  "registration_enabled", 
  "social_google_enabled", 
  "social_google_client_id", 
  "social_facebook_enabled", 
  "social_facebook_app_id"
];

export default async function RegisterPageWrapper() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: SETTING_KEYS
      }
    }
  });

  const config: Record<string, string> = {};
  for (const row of configs) {
    config[row.key] = row.value;
  }

  const registrationDisabled = config.registration_enabled === "false";
  const googleEnabled = config.social_google_enabled === "true";
  const facebookEnabled = config.social_facebook_enabled === "true";

  return (
    <RegisterClient 
      registrationDisabled={registrationDisabled} 
      googleEnabled={googleEnabled}
      facebookEnabled={facebookEnabled}
      googleClientId={config.social_google_client_id}
      facebookAppId={config.social_facebook_app_id}
    />
  );
}