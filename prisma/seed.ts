import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.bookmark.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@serahub.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  const demo = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@serahub.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Created demo user:", demo.email);

  const categoryNames = [
    "Software Engineering",
    "Cloud Computing",
    "Blockchain",
    "Content Writing",
    "Cybersecurity",
    "Data Science",
    "DevOps",
    "Machine Learning",
    "Web Development",
  ];
  const categories = [];

  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.create({
      data: { name, slug },
    });
    categories.push(cat);
  }

  console.log(`Created ${categories.length} categories.`);

  const webDev = categories.find((c) => c.name === "Web Development")?.id;
  const cloud = categories.find((c) => c.name === "Cloud Computing")?.id;
  const dataScience = categories.find((c) => c.name === "Data Science")?.id;
  const cybersecurity = categories.find((c) => c.name === "Cybersecurity")?.id;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const jobsData = [
    {
      title: "Senior Full-Stack Engineer",
      slug: "senior-full-stack-engineer-01",
      description:
        "We are seeking a seasoned Full-Stack Engineer with extensive experience in Next.js, Node.js, and Prisma. You will lead our primary scaling initiatives, manage a team of 3 developers, and architect highly available micro-services. Competitive equity and full remote flexibility.",
      source: "Remote, Global",
      applyLink: "https://example.com/apply",
      deadline: nextMonth,
      categoryId: webDev,
    },
    {
      title: "Cloud Infrastructure Architect",
      slug: "cloud-infrastructure-architect-01",
      description:
        "Looking for an expert to design and maintain our multi-region AWS and Azure environments. Strong proficiency in Terraform and Kubernetes is essential. We expect candidates to hold specialized AWS certifications and have 5+ years of demonstrable operational excellence.",
      source: "Hybrid, New York",
      applyLink: "https://example.com/apply",
      deadline: nextWeek,
      categoryId: cloud,
    },
    {
      title: "Machine Learning Researcher",
      slug: "machine-learning-researcher-01",
      description:
        "An incredible opportunity to join our R&D lab focusing on generative models and predictive anomaly detection. PhD or equivalent research background necessary. Work directly with massive enterprise datasets.",
      source: "On-site, London",
      applyLink: "https://example.com/apply",
      deadline: null,
      categoryId: dataScience,
    },
    {
      title: "Penetration Tester",
      slug: "penetration-tester-01",
      description:
        "Conduct routine security assessments on web, mobile, and network interfaces. Familiarity with modern SaaS architectures required.",
      source: "Remote",
      applyLink: "https://example.com/apply",
      deadline: nextMonth,
      categoryId: cybersecurity,
    },
  ];

  for (const j of jobsData) {
    await prisma.job.create({ data: j });
  }
  console.log(`Created ${jobsData.length} jobs.`);

  const bidsData = [
    {
      title: "Landing Page Design & Development",
      slug: "landing-page-design-development-01",
      description: `Need a high-converting landing page designed and developed for our new product launch. Must be responsive and optimized for performance. We are launching a new SaaS product and need a landing page that converts. 

Requirements:
- Hero section with clear value proposition
- Feature highlights section
- Social proof / testimonials
- Pricing comparison
- Mobile-first responsive design
- Page speed (< 3s load)

Tech: Next.js, Tailwind CSS, Framer Motion.`,
      source: "Agency Platform",
      applyLink: "https://example.com/bid",
      deadline: nextWeek,
      categoryId: webDev,
    },
    {
      title: "Government E-Commerce Subcontract",
      slug: "gov-ecommerce-subcontract-01",
      description:
        "Seeking a qualified technical team to architect a highly secure e-commerce gateway adhering to strict federal procurement regulations. Includes 2 years of ongoing maintenance SLAs.",
      source: "Gov.Tender Portal",
      applyLink: "https://example.com/bid",
      deadline: nextMonth,
      categoryId: webDev,
    },
    {
      title: "Enterprise Database Migration",
      slug: "enterprise-database-migration-01",
      description:
        "Migrating 4TB of legacy monolithic Oracle databases over to a clustered PostgreSQL environment with minimal downtime. The ideal bid must detail exact rollback strategies and parallel migration techniques.",
      source: "Internal Private",
      applyLink: "https://example.com/bid",
      deadline: null,
      categoryId: cloud,
    },
  ];

  for (const b of bidsData) {
    await prisma.bid.create({ data: b });
  }
  console.log(`Created ${bidsData.length} bids.`);

  console.log("Seeding finished successfully!");
  console.log("");
  console.log("=== Demo Accounts ===");
  console.log("  Admin   → admin@serahub.com / admin123");
  console.log("  User    → demo@serahub.com / admin123");
  console.log("====================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });