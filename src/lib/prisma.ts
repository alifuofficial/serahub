import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getDbUrl = () => {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (url.startsWith("file:.") && typeof process !== "undefined") {
    const dbPath = url.replace("file:", "");
    return `file:${path.resolve(process.cwd(), dbPath)}`;
  }
  return url;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDbUrl(),
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Enable SQLite WAL mode for performance
if (typeof window === "undefined") {
  prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')
    .catch(() => {}); // Ignore errors during build if DB is not ready
  prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;')
    .catch(() => {});
}

export { prisma };