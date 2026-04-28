import { prisma } from "@/lib/prisma";
import JobCard from "@/components/ui/JobCard";
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

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

import { getModuleStatus } from "@/lib/config";
import ComingSoonModule from "@/components/common/ComingSoonModule";

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

  const { q } = await searchParams;
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

  const where: any = { status: "PUBLISHED" };
  if (q) {
    where.OR = searchTerms.map(term => ({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { company: { contains: term, mode: "insensitive" } },
        { locationType: { contains: term, mode: "insensitive" } },
        { employmentType: { contains: term, mode: "insensitive" } },
        { careerLevel: { contains: term, mode: "insensitive" } },
      ]
    }));
  }

  const [jobs, userBookmarks] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { jobId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Explore Jobs</h1>
          <p className="text-secondary-foreground text-lg">
            {q ? `${jobs.length} result${jobs.length !== 1 ? "s" : ""} for "${q}"` : `Discover ${jobs.length} opportunities from top employers and public institutions.`}
          </p>
        </div>

        <div className="mb-8">
          <SearchForm
            placeholder="Search jobs by title, source, or keyword..."
            className="max-w-xl mx-auto"
            inputClassName="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">{q ? "No Jobs Match Your Search" : "No Jobs Found"}</h3>
            <p className="text-slate-500">{q ? "Try adjusting your search terms or browse all jobs." : "We are currently updating our database. Please check back later."}</p>
          </div>
        )}
      </div>
    </div>
  );
}