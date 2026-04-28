"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface SearchFormProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  variant?: "nav" | "hero";
}

export default function SearchForm({
  placeholder = "Search opportunities...",
  className,
  inputClassName,
  buttonClassName,
  variant = "nav",
}: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Detect if natural language (contains multiple words)
    const words = q.split(/\s+/).filter(w => w.length > 2);
    
    if (words.length >= 3) {
      handleAISearch();
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleAISearch = async () => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/search/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error("AI search failed");

      const data = await res.json();
      
      const params = new URLSearchParams();
      if (data.q) params.set("q", data.q);
      if (data.category) params.set("cat", data.category);
      if (data.type) params.set("type", data.type);
      if (data.locationType) params.set("loc", data.locationType);
      if (data.explanation) params.set("ai", data.explanation);

      router.push(`/search?${params.toString()}`);
    } catch (err) {
      console.error(err);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-violet-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="relative bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center p-2 shadow-xl shadow-slate-200/40">
            <div className="flex flex-1 items-center">
              <div className="pl-4 pr-2 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-sparkle"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find my next remote software job..."
                className={inputClassName || "flex-1 bg-transparent border-none outline-none py-3 px-2 text-slate-700 placeholder-slate-400 font-medium text-base"}
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="relative overflow-hidden flex items-center justify-center gap-2.5 px-10 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all text-sm group/btn"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Smart Search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover/btn:scale-110 transition-transform"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 px-2">
           <p className="text-[11px] text-slate-400 font-medium">
             <span className="font-bold text-slate-500 uppercase tracking-wider mr-2 text-[10px]">Try searching:</span> 
             <button type="button" onClick={() => setQuery("Remote react jobs in Ethiopia")} className="hover:text-primary transition-colors cursor-pointer">"Remote react jobs in Ethiopia"</button>
             <span className="mx-2 opacity-30">|</span>
             <button type="button" onClick={() => setQuery("Construction bids for 2024")} className="hover:text-primary transition-colors cursor-pointer">"Construction bids for 2024"</button>
           </p>
        </div>
      </form>
    );
  }



  return (
    <form onSubmit={handleSubmit} className={className || "flex-1 relative hidden lg:block"}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={inputClassName || "w-full bg-slate-100 border-transparent text-sm pl-9 pr-4 py-2 rounded-full focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"}
      />
    </form>
  );
}