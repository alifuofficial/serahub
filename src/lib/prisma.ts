import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

import Database from "better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  let url = process.env.DATABASE_URL || "file:./dev.db";
  
  // Ensure absolute path for SQLite file URLs to prevent issues with different CWDs
  let dbPath = url.replace("file:", "");
  if (url.startsWith("file:.") && !url.includes(":memory:")) {
    dbPath = path.resolve(process.cwd(), dbPath);
  }

  // Use better-sqlite3 directly to enable WAL mode
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL'); // Extra speed boost for WAL

  const adapter = new PrismaBetterSqlite3(sqlite, { url });
  return new PrismaClient({ adapter });
}

// Force reload after schema update
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };