import { prisma } from "@/lib/prisma";
import JobCard from "@/components/ui/JobCard";
import BidCard from "@/components/ui/BidCard";
import { getSession } from "@/lib/session";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Jobs & Bids`,
    description: `Browse all jobs and bids in the ${category.name} category on SeraHub. Discover opportunities and tenders tailored to your expertise.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const [jobs, bids, userBookmarks] = await Promise.all([
    prisma.job.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bid.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { jobId: true, bidId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));
  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  const total = jobs.length + bids.length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://serahub.com" },
        { name: "Categories", url: "https://serahub.com" },
        { name: category.name, url: `https://serahub.com/categories/${category.slug}` },
      ]} />
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Categories</span>
          <span>/</span>
          <span className="text-primary font-semibold">{category.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/10">
              Category
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {category.name}
            </h1>
            <p className="text-slate-500 text-lg">
              {total === 0 
                ? "No opportunities found in this category yet." 
                : `Showing ${total} opportunity${total !== 1 ? "s" : ""} found in this category.`}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-900 font-bold">{jobs.length}</span>
              <span className="text-slate-400 text-[10px] uppercase">Jobs</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-900 font-bold">{bids.length}</span>
              <span className="text-slate-400 text-[10px] uppercase">Bids</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Available Jobs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Bids Section */}
        {bids.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-orange-400 rounded-full" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Tenders & Bids</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bids.map((bid) => (
                <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="text-center py-24 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl">
             <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No Content Yet</h3>
             <p className="text-slate-500 max-w-md mx-auto">We haven't posted any jobs or bids in the <span className="font-semibold text-slate-700">{category.name}</span> category recently. Check back soon!</p>
             <Link href="/" className="inline-flex items-center gap-2 mt-8 text-primary font-bold hover:underline">
               Return Home
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
