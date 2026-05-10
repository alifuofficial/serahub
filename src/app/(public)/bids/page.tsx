import { prisma } from "@/lib/prisma";
import BidCard from "@/components/ui/BidCard";
import SearchForm from "@/components/common/SearchForm";
import { getSession } from "@/lib/session";
import { Metadata } from "next";
import { trackUserAction } from "@/lib/tracking";
import { expandSearchQuery } from "@/lib/semantic-search";

export const metadata: Metadata = {
  title: "Tenders & Bids",
  description: "Browse the latest tenders, bids, and procurement opportunities. Find government and private sector contracts on SeraHub.",
  keywords: ["bids", "tenders", "procurement", "contracts", "Ethiopia tenders", "government bids"],
  alternates: { canonical: "/bids" },
  openGraph: { title: "Tenders & Bids | SeraHub", description: "Browse the latest tenders, bids, and procurement opportunities on SeraHub.", url: "/bids" },
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ 
    q?: string; 
    page?: string;
    category?: string;
  }>;
}

import { getModuleStatus } from "@/lib/config";
import ComingSoonModule from "@/components/common/ComingSoonModule";
import Pagination from "@/components/common/Pagination";
import FilterSidebar from "@/components/common/FilterSidebar";

const PAGE_SIZE = 12;

export default async function BidsPage({ searchParams }: PageProps) {
  const { bidsEnabled } = await getModuleStatus();
  
  if (!bidsEnabled) {
    return (
      <ComingSoonModule 
        title="Tender & Bid Hub" 
        message="We are currently aggregating the latest procurement opportunities and public tenders. This module will be available again very soon!"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        }
      />
    );
  }

  const { q, page: pageParam, category } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

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
        { source: { contains: term, mode: "insensitive" } },
      ]
    }));
  }

  if (category) where.categoryId = category;

  const session = await getSession();

  const [bids, totalCount, categories, userBookmarks] = await Promise.all([
    prisma.bid.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } }
    }),
    prisma.bid.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { bidId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Tenders & Bids</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {q ? `Showing ${totalCount} results for "${q}"` : `Access ${totalCount} procurement opportunities and business contracts.`}
          </p>
        </div>

        <div className="mb-12">
          <SearchForm
            placeholder="Search tenders and bids..."
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <FilterSidebar categories={categories} type="bids" />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {bids.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bids.map((bid) => (
                    <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
                  ))}
                </div>

                <Pagination 
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                  baseUrl="/bids"
                  searchParams={{ q, category }}
                />
              </>
            ) : (
              <div className="text-center py-24 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No tenders match your filters</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you are looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}