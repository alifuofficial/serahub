import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL is now provided via Dockerfile or environment
const prisma = globalForPrisma.prisma ?? new PrismaClient();

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