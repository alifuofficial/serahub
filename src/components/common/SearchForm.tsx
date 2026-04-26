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
    if (q) {
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
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/10 animate-in fade-in slide-in-from-left-2 duration-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Powered by AI</span>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center p-2 shadow-lg shadow-slate-200/50 gap-2">
          <div className="flex flex-1 items-center">
            <div className="pl-5 pr-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={inputClassName || "flex-1 bg-transparent border-none outline-none py-3 px-2 text-slate-700 placeholder-slate-400"}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleAISearch}
              disabled={isLoading || !query.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all text-sm whitespace-nowrap"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              )}
              Smart Match
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className={buttonClassName || "btn-primary py-3 px-8 text-sm font-bold rounded-xl whitespace-nowrap"}
            >
              Search
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400 px-4">
          <span className="font-semibold text-slate-500">Tip:</span> Try natural language like <span className="italic">"I'm looking for a remote accounting job"</span> and use Smart Match.
        </p>
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