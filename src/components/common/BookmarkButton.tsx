"use client";

import React, { useState, useTransition } from "react";
import { toggleBookmarkAction } from "@/actions/user";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  type: "JOB" | "BID";
  initialIsBookmarked?: boolean;
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({ id, type, initialIsBookmarked = false, className = "", showText = false }: Props) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      const res = await toggleBookmarkAction(type, id);
      if (res.error) {
        // Revert on error
        setIsBookmarked(!nextState);
      } else if (res.success) {
        setIsBookmarked(res.bookmarked || false);
      }
    });
  };

  if (showText) {
    return (
      <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 rounded-full border transition-all ${isBookmarked ? "bg-red-50 border-red-200 text-red-500 shadow-sm shadow-red-100" : "bg-white border-slate-200 text-slate-600 hover:border-primary/30 hover:bg-[#e6fbf4]/50"} ${className}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isBookmarked ? "scale-110 transition-transform" : ""}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        {isBookmarked ? "Saved" : "Bookmark"}
      </button>
    );
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`relative z-10 p-1.5 rounded-xl transition-all ${isBookmarked ? "text-red-500 bg-red-50" : "text-slate-300 hover:text-red-500 hover:bg-red-50"} ${className}`}
      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isBookmarked ? "animate-pulse-soft" : "group-hover:scale-110 transition-transform"}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    </button>
  );
}
