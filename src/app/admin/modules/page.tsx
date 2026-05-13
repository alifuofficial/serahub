import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ModulesClient from "./ModulesClient";

export const metadata: Metadata = {
  title: "Modules Management | Admin Dashboard | SeraHub",
};

export const dynamic = "force-dynamic";

const MODULE_KEYS = [
  "cvanalyzer_enabled",
  "cvanalyzer_price_etb",
  "sub_pro_job_enabled",
  "sub_pro_job_price",
  "sub_pro_bid_enabled",
  "sub_pro_bid_price",
  "sub_trial_enabled",
  "sub_trial_days",
  "module_bid_summarizer_enabled",
  "module_bid_summarizer_price",
  "module_ad_free_enabled",
  "module_ad_free_price",
];

export default async function ModulesPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const configRows = await prisma.siteConfig.findMany({ where: { key: { in: MODULE_KEYS } } });

  const config: Record<string, string> = {};
  for (const key of MODULE_KEYS) {
    config[key] = "";
  }
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  return <ModulesClient user={session} config={config} />;
}
