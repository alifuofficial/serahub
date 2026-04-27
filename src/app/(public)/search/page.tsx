import { prisma } from "@/lib/prisma";
import JobCard from "@/components/ui/JobCard";
import BidCard from "@/components/ui/BidCard";
import SearchForm from "@/components/common/SearchForm";
import { getSession } from "@/lib/session";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  
  return {
    title: query ? `Search results for "${query}"` : "Search Jobs & Bids",
    description: query 
      ? `Discover the latest jobs and bids matching "${query}" on SeraHub.` 
      : "Search for the latest jobs and bids on SeraHub.",
    robots: { index: false, follow: true }, // Don't index search result pages to avoid thin content
  };
}

export const revalidate = 0; // Search results should be fresh

interface PageProps {
  searchParams: Promise<{ 
    q?: string;
    cat?: string;
    type?: string;
    loc?: string;
    ai?: string; // AI explanation
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const cat = params.cat?.trim() || "";
  const type = (params.type?.toUpperCase() as "JOB" | "BID" | "BOTH") || "BOTH";
  const loc = params.loc?.trim() || "";
  const aiExplanation = params.ai?.trim() || "";

  const session = await getSession();

  // 1. Build Where Clauses
  const jobWhere: any = { status: "PUBLISHED" };
  const bidWhere: any = { status: "PUBLISHED" };

  if (q) {
    const keywords = q.split(/\s+/).filter(k => k.length > 2);
    
    if (keywords.length > 0) {
      const searchConditions = keywords.map(k => ({
        OR: [
          { title: { contains: k } },
          { description: { contains: k } },
          { source: { contains: k } },
          { company: { contains: k } },
        ]
      }));
      
      // Using AND between keywords (e.g. "accountant" AND "remote")
      // but OR within each keyword check
      jobWhere.AND = searchConditions;
      bidWhere.AND = keywords.map(k => ({
        OR: [
          { title: { contains: k } },
          { description: { contains: k } },
          { source: { contains: k } },
        ]
      }));
    } else {
      // Fallback to exact match if keywords are too short
      const exactConditions = [
        { title: { contains: q } },
        { description: { contains: q } },
        { source: { contains: q } },
      ];
      jobWhere.OR = [...exactConditions, { company: { contains: q } }];
      bidWhere.OR = exactConditions;
    }
  }

  if (cat) {
    const category = await prisma.category.findFirst({
      where: { OR: [{ name: cat }, { slug: cat }] }
    });
    if (category) {
      jobWhere.categoryId = category.id;
      bidWhere.categoryId = category.id;
    }
  }

  if (loc) {
    jobWhere.locationType = loc;
  }

  // 2. Fetch Data
  const [jobs, bids, userBookmarks] = await Promise.all([
    type === "BID" ? Promise.resolve([]) : prisma.job.findMany({
      where: jobWhere,
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    type === "JOB" ? Promise.resolve([]) : prisma.bid.findMany({
      where: bidWhere,
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { jobId: true, bidId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));
  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  const hasResults = jobs.length > 0 || bids.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 text-center">Search Results</h1>
        <SearchForm 
          variant="hero" 
          placeholder="Try 'Remote software engineering jobs'..." 
          className="mb-8"
        />
        
        {aiExplanation && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">AI Match</p>
              <p className="text-slate-600 font-medium">{aiExplanation}</p>
            </div>
          </div>
        )}
      </div>

      {!hasResults ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No results found</h2>
          <p className="text-slate-500">Try adjusting your search terms or use a simpler query.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {jobs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-slate-800">Job Opportunities ({jobs.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
                ))}
              </div>
            </div>
          )}

          {bids.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-orange-400 rounded-full" />
                <h2 className="text-xl font-bold text-slate-800">Active Bids & Tenders ({bids.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
