const { generateNewsletter } = require('./src/lib/ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = [
    { title: "Software Engineer", link: "https://serahub.click/jobs/software-engineer", metaDescription: "We are looking for a software engineer." }
  ];
  console.log("Generating newsletter...");
  const result = await generateNewsletter(jobs);
  console.log("Result:", result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
