import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  let url = process.env.DATABASE_URL || "file:./dev.db";
  
  // Ensure absolute path for SQLite file URLs to prevent issues with different CWDs
  if (url.startsWith("file:.") && !url.includes(":memory:")) {
    const dbRelativePath = url.replace("file:", "");
    const dbPath = path.resolve(process.cwd(), dbRelativePath);
    url = `file:${dbPath}`;
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

// Force reload after schema update
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };