import { prisma } from "./src/lib/prisma";

async function checkJobs() {
  const jobs = await prisma.job.findMany({
    where: {
      OR: [
        { title: { contains: "account" } },
        { description: { contains: "account" } }
      ]
    },
    select: { title: true, status: true, categoryId: true }
  });
  console.log("Jobs found:", JSON.stringify(jobs, null, 2));
  
  const categories = await prisma.category.findMany();
  console.log("Categories:", JSON.stringify(categories, null, 2));
}

checkJobs();
