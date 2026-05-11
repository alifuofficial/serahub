import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

async function main() {
  const dbPath = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace("file:", "");
  console.log(`Connecting to database at: ${dbPath}`);
  
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  const tablesToDrop = ["Property", "Unit", "SmsTemplate", "SystemSettings"];

  for (const table of tablesToDrop) {
    try {
      console.log(`Attempting to drop table: ${table}...`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}"`);
      console.log(`Successfully dropped (or already gone): ${table}`);
    } catch (error) {
      console.error(`Failed to drop ${table}:`, error);
    }
  }

  await prisma.$disconnect();
  console.log("Cleanup complete.");
}

main();
