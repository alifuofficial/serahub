import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set even during build time to prevent initialization errors
if (typeof process !== "undefined" && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), "dev.db")}`;
} else if (typeof process !== "undefined" && process.env.DATABASE_URL?.startsWith("file:.")) {
  // Normalize relative paths to absolute paths
  const dbPath = process.env.DATABASE_URL.replace("file:", "");
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), dbPath)}`;
}

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Enable SQLite WAL mode for performance
if (typeof window === "undefined") {
  prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')
    .catch(() => {}); // Ignore errors during build/prerendering
  prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;')
    .catch(() => {});
}

export { prisma };