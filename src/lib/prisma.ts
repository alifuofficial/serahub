import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Prisma Client initialization with better-sqlite3 driver adapter.
 * We use a memory database during the Next.js build phase.
 * We also extend the client to gracefully handle missing tables (TableDoesNotExist)
 * which occurs during build-time static generation on an empty memory DB.
 */
function createPrismaClient() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL);
  
  let dbPath = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
  
  if (isBuild) {
    console.log("[Prisma] Build phase detected, using memory database adapter.");
    dbPath = ":memory:";
  }

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  
  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  // Extend client to handle missing tables during build
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (error: any) {
            // P2021 is "The table `main.Model` does not exist in the current database."
            if (error?.code === 'P2021') {
              console.warn(`[Prisma] Table ${model} does not exist. Returning empty result during build.`);
              
              // Return appropriate empty values based on the operation
              if (operation.includes('count')) return 0;
              if (operation.includes('aggregate')) return { _sum: {}, _avg: {}, _count: {}, _min: {}, _max: {} };
              if (operation.includes('groupBy')) return [];
              if (operation.includes('findMany')) return [];
              
              return null;
            }
            throw error;
          }
        },
      },
    },
  });
}

// Note: The type of extended client is complex, so we use 'any' for the global singleton
export const prisma = (globalForPrisma.prisma || createPrismaClient()) as any;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;