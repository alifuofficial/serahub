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
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/jobs?q=${encodeURIComponent(q)}`);
    }
  };

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl flex items-center p-2 shadow-lg shadow-slate-200/50">
          <div className="pl-5 pr-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={inputClassName || "flex-1 bg-transparent border-none outline-none py-3 px-2 text-slate-700 placeholder-slate-400"}
          />
          <button type="submit" className={buttonClassName || "btn-primary py-3 px-8"}>Search</button>
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