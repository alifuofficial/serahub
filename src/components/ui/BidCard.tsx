import Link from "next/link";
import { Bid } from "@prisma/client";
import BookmarkButton from "@/components/common/BookmarkButton";
import { getPlainText } from "@/components/editor/Renderer";

interface BidCardProps {
  bid: Pick<Bid, "id" | "title" | "slug" | "description" | "source" | "deadline" | "createdAt">;
  isBookmarked?: boolean;
}

export default function BidCard({ bid, isBookmarked = false }: BidCardProps) {
  return (
    <div className="card p-6 flex flex-col h-full bg-white relative hover:border-orange-200 group">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          Tender
        </span>
        <span className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Featured
        </span>
      </div>

      <h3 className="font-bold text-lg leading-snug text-slate-800 mb-2 group-hover:text-orange-500 transition-colors">
        <Link href={`/bids/${bid.slug}`} className="before:absolute before:inset-0">
          {bid.title}
        </Link>
      </h3>
      
      <p className="text-slate-500 text-sm line-clamp-2 mb-5 flex-grow font-normal leading-relaxed">
        {getPlainText(bid.description)}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-medium">Contract</span>
        {bid.source && <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-medium">{bid.source}</span>}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm shadow-orange-200">A</div>
          Admin User
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs font-medium">
            3 d
          </span>
          <BookmarkButton id={bid.id} type="BID" initialIsBookmarked={isBookmarked} />
        </div>
      </div>
    </div>
  );
}