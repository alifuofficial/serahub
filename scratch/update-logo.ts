import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const keys = ["appearance_logo_url", "site_name"];
  const values = {
    appearance_logo_url: "/logo.png",
    site_name: "SeraHub",
  };

  for (const [key, value] of Object.entries(values)) {
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Database updated with new logo path.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
