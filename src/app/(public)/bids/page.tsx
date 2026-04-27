import { prisma } from "@/lib/prisma";
import BidCard from "@/components/ui/BidCard";
import SearchForm from "@/components/common/SearchForm";
import { getSession } from "@/lib/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenders & Bids",
  description: "Browse the latest tenders, bids, and procurement opportunities. Find government and private sector contracts on SeraHub.",
  keywords: ["bids", "tenders", "procurement", "contracts", "Ethiopia tenders", "government bids"],
  alternates: { canonical: "/bids" },
  openGraph: { title: "Tenders & Bids | SeraHub", description: "Browse the latest tenders, bids, and procurement opportunities on SeraHub.", url: "/bids" },
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

import { getModuleStatus } from "@/lib/config";
import ComingSoonModule from "@/components/common/ComingSoonModule";

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

  const { q } = await searchParams;
  const search = q?.trim() || "";

  const session = await getSession();

  const [bids, userBookmarks] = await Promise.all([
    prisma.bid.findMany({
      where: {
        status: "PUBLISHED",
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { source: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { bidId: true }
    }) : Promise.resolve([])
  ]);

  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Tenders & Bids</h1>
          <p className="text-secondary-foreground text-lg">
            {search ? `${bids.length} result${bids.length !== 1 ? "s" : ""} for "${search}"` : "Access procurement opportunities and business contracts."}
          </p>
        </div>

        <div className="mb-8">
          <SearchForm
            placeholder="Search tenders and bids..."
            className="max-w-xl mx-auto"
            inputClassName="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none transition-all"
          />
        </div>

        {bids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bids.map((bid) => (
              <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">{search ? "No Bids Match Your Search" : "No Tenders Found"}</h3>
            <p className="text-slate-500">{search ? "Try adjusting your search terms or browse all bids." : "We are currently updating our database. Please check back later."}</p>
          </div>
        )}
      </div>
    </div>
  );
}