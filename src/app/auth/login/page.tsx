import { prisma } from "@/lib/prisma";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

const SETTING_KEYS = ["social_google_enabled", "social_google_client_id", "social_facebook_enabled", "social_facebook_app_id"];

export default async function LoginPage() {
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

  return (
    <LoginClient 
      googleEnabled={config.social_google_enabled === "true"}
      facebookEnabled={config.social_facebook_enabled === "true"}
      googleClientId={config.social_google_client_id}
      facebookAppId={config.social_facebook_app_id}
    />
  );
}