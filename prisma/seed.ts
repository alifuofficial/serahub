import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const dbPath = (process.env.DATABASE_URL || "file:./dev.db").replace("file:", "");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking database...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "alifuhaji@gmail.com" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists.");
  } else {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("@mySerahub@303", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "alifuhaji@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", admin.email);
  }

  // Update existing users who might have a null password after schema change
  console.log("Checking for users without passwords...");
  const usersWithoutPassword = await prisma.user.findMany({
    where: { password: null }
  });

  if (usersWithoutPassword.length > 0) {
    const defaultHashedPassword = await bcrypt.hash("@mySerahub@303", 10);
    for (const user of usersWithoutPassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: defaultHashedPassword }
      });
      console.log(`Updated password for user: ${user.email}`);
    }
  }

  console.log("Initializing site configuration...");
  const configs = [
    { key: "site_name", value: "SeraHub" },
    { key: "jobs_enabled", value: "true" },
    { key: "bids_enabled", value: "true" },
  ];

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log("Site configuration initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });