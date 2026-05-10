import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Prisma Client initialization with better-sqlite3 driver adapter.
 * We use a memory database during the Next.js build phase to prevent file lock issues
 * while satisfying the requirement for an adapter when Turbopack forces "client" engine mode.
 */
function createPrismaClient() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  
  // Clean the URL (better-sqlite3 expects a path, not file: prefix)
  let dbPath = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
  
  if (isBuild) {
    console.log("[Prisma] Build phase detected, using memory database adapter.");
    dbPath = ":memory:";
  }

  const db = new Database(dbPath);
  
  // Basic SQLite optimizations
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  const adapter = new PrismaBetterSqlite3(db);
  
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;