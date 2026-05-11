import { prisma } from "@/lib/prisma";
import JobCard from "@/components/ui/JobCard";
import Link from "next/link";
import SearchForm from "@/components/common/SearchForm";
import { getSession } from "@/lib/session";
import { Metadata } from "next";
import { trackUserAction } from "@/lib/tracking";
import { expandSearchQuery } from "@/lib/semantic-search";

export const metadata: Metadata = {
  title: "All Jobs",
  description: "Browse the latest job opportunities in Ethiopia. Find remote, hybrid, and on-site positions across tech, finance, marketing, and more on SeraHub.",
  keywords: ["jobs", "careers", "Ethiopia jobs", "remote jobs", "vacancies", "hiring"],
  alternates: { canonical: "/jobs" },
  openGraph: { title: "All Jobs | SeraHub", description: "Browse the latest job opportunities in Ethiopia on SeraHub.", url: "/jobs" },
};

interface PageProps {
  searchParams: Promise<{ 
    q?: string; 
    page?: string;
    location?: string;
    employment?: string;
    level?: string;
    category?: string;
  }>;
}

import { getModuleStatus } from "@/lib/config";
import ComingSoonModule from "@/components/common/ComingSoonModule";
import Pagination from "@/components/common/Pagination";
import FilterSidebar from "@/components/common/FilterSidebar";

const PAGE_SIZE = 12;

export default async function JobsPage({ searchParams }: PageProps) {
  const { jobsEnabled } = await getModuleStatus();
  
  if (!jobsEnabled) {
    return (
      <ComingSoonModule 
        title="Job Aggregator" 
        message="We are fine-tuning our AI matching engine to bring you the most relevant job opportunities in Ethiopia. We'll be back shortly!"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        }
      />
    );
  }

  const { q, page: pageParam, location, employment, level, category } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;
  const session = await getSession();

  // 1. Track search (background)
  if (q) {
    trackUserAction("SEARCH", q);
  }

  // 2. Expand query semantically
  let searchTerms = [q || ""];
  if (q && q.length > 2) {
    searchTerms = await expandSearchQuery(q);
  }

  // 3. Build Filter Query
  const where: any = { status: "PUBLISHED" };
  
  if (q) {
    where.OR = searchTerms.map(term => ({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { company: { contains: term, mode: "insensitive" } },
        { keywords: { contains: term, mode: "insensitive" } },
      ]
    }));
  }

  if (location) where.locationType = location;
  if (employment) where.employmentType = employment;
  if (level) where.careerLevel = level;
  if (category) where.categoryId = category;

  const [jobs, totalCount, categories, userBookmarks] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } }
    }),
    prisma.job.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { jobId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Explore Opportunities</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {q ? `Showing ${totalCount} results for "${q}"` : `Discover ${totalCount} public and private sector opportunities across Ethiopia.`}
          </p>
        </div>

        <div className="mb-12">
          <SearchForm
            placeholder="Search by title, company, or keywords..."
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <FilterSidebar categories={categories} type="jobs" />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
                  ))}
                </div>
                
                <Pagination 
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                  baseUrl="/jobs"
                  searchParams={{ q, location, employment, level, category }}
                />
              </>
            ) : (
              <div className="text-center py-24 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results match your filters</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you are looking for.</p>
                <Link 
                  href="/jobs"
                  className="mt-6 inline-block text-primary font-semibold hover:underline"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}