import { prisma } from "@/lib/prisma";
import JobCard from "@/components/ui/JobCard";
import SearchForm from "@/components/common/SearchForm";
import { getSession } from "@/lib/session";
import { Metadata } from "next";

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

export default async function JobsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const search = q?.trim() || "";
  const session = await getSession();

  const [jobs, userBookmarks] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "PUBLISHED",
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { source: { contains: search } },
                { company: { contains: search } },
                { locationType: { contains: search } },
                { employmentType: { contains: search } },
                { careerLevel: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
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
            {search ? `${jobs.length} result${jobs.length !== 1 ? "s" : ""} for "${search}"` : `Discover ${jobs.length} opportunities from top employers and public institutions.`}
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
            <h3 className="text-xl font-semibold mb-2">{search ? "No Jobs Match Your Search" : "No Jobs Found"}</h3>
            <p className="text-slate-500">{search ? "Try adjusting your search terms or browse all jobs." : "We are currently updating our database. Please check back later."}</p>
          </div>
        )}
      </div>
    </div>
  );
}