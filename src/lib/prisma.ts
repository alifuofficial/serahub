import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Provide a standard 'log' option to satisfy the "non-empty options" requirement
// while relying on the environment variable for the connection string
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

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