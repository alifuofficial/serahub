const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcrypt");

(async () => {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const existing = await prisma.user.findUnique({ where: { email: "demo@serahub.com" } });
  if (existing) {
    console.log("Demo user already exists:", existing.email);
    await prisma.$disconnect();
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@serahub.com",
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log("Created demo user:", user.email);
  await prisma.$disconnect();
})();