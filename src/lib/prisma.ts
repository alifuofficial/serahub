import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Enable SQLite WAL mode for performance
// This is safe to run multiple times and ensures the DB is optimized for 10k+ records
if (typeof window === "undefined") {
  prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')
    .catch(err => console.error("Failed to enable WAL mode:", err));
  prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;')
    .catch(err => {});
}

export { prisma };