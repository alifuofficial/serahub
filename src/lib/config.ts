import { prisma } from "./prisma";

/**
 * Safely fetches site configurations, falling back to defaults if the database 
 * is missing tables (common during build phase with memory database).
 */
export async function getModuleStatus() {
  try {
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
  } catch (error) {
    // If table doesn't exist during build, return defaults
    return {
      jobsEnabled: true,
      bidsEnabled: true,
    };
  }
}

export async function getConfig(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key }
    });
    return config?.value || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}
