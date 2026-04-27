import { prisma } from "./prisma";

export async function getModuleStatus() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["jobs_enabled", "bids_enabled"] }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    jobsEnabled: configMap.jobs_enabled !== "false",
    bidsEnabled: configMap.bids_enabled !== "false",
  };
}

export async function getConfig(key: string, defaultValue: string = ""): Promise<string> {
  const config = await prisma.siteConfig.findUnique({
    where: { key }
  });
  return config?.value || defaultValue;
}
