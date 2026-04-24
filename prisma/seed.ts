import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking database...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "alifuhaji@gmail.com" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });