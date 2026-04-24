"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/actions/subscribers";

interface NewsletterSectionProps {
  variant?: "default" | "green" | "orange";
  heading?: string;
  subheading?: string;
}

export default function NewsletterSection({ 
  variant = "default",
  heading = "Stay ahead of the curve",
  subheading = "Get the latest jobs, bids, and opportunities delivered to your inbox every week. No spam, unsubscribe anytime."
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    startTransition(async () => {
      const result = await subscribeAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setEmail("");
      }
    });
  };

  const isGreen = variant === "green";
  const isOrange = variant === "orange";

  return (
    <section className={`py-16 ${isGreen ? 'bg-gradient-to-br from-[#e6fbf4] to-white' : isOrange ? 'bg-gradient-to-br from-orange-50 to-white' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <div className={`w-14 h-14 rounded-2xl ${isGreen ? 'bg-primary/10' : isOrange ? 'bg-orange-100' : 'bg-primary/10'} flex items-center justify-center mx-auto mb-6`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={isGreen ? '#00c087' : isOrange ? '#f97316' : '#00c087'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">{heading}</h2>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">{subheading}</p>

        {submitted ? (
          <div className="bg-white border border-primary/20 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-bold text-slate-800 text-lg">You&apos;re in!</p>
            <p className="text-slate-500 text-sm mt-1">Check your inbox for a confirmation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email address" 
                required 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" 
              />
            </div>
            <button type="submit" disabled={isPending} className={`${isOrange ? 'bg-orange-500 hover:bg-orange-600' : ''} btn-primary py-3.5 px-6 text-sm whitespace-nowrap shadow-sm disabled:opacity-50`}>
              {isPending ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}

        {error && !submitted && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <p className="text-xs text-slate-400 mt-4">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}