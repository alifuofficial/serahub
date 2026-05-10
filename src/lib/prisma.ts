import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use datasourceUrl (singular) which is the modern way to override the connection string
// This also satisfies the "non-empty options" requirement during build
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
} as any);

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