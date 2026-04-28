"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { handleUnsubscribeAction } from "@/actions/unsubscribe";

export default function UnsubscribeClient({ email, currentStatus }: { email: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; frequency?: string }>({});
  const [emailInput, setEmailInput] = useState(email);

  const handleSubmit = (option: "SNOOZE" | "NONE") => {
    const fd = new FormData();
    fd.append("email", emailInput);
    fd.append("option", option);

    startTransition(async () => {
      const res = await handleUnsubscribeAction(fd);
      setResult(res);
    });
  };

  if (result.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 border border-slate-100 shadow-xl text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#e6fbf4] rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Preference Updated</h2>
          <p className="text-slate-500 leading-relaxed mb-10">
            {result.frequency === "WEEKLY" 
              ? "We've snoozed your updates. You will now only receive our best curated highlights once a week."
              : "You've been successfully unsubscribed. We're sorry to see you go!"}
          </p>
          <Link href="/" className="btn-primary inline-block w-full py-4 font-bold text-sm">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[40px] p-10 lg:p-14 border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
            Subscription Settings
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Manage your updates</h1>
          <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
            Take a break or change how often you hear from us.
          </p>
        </div>

        {!email && (
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirm your email</label>
            <input 
              type="email" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>
        )}

        {result.error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
            {result.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <button 
            disabled={isPending || !emailInput}
            onClick={() => handleSubmit("SNOOZE")}
            className="flex items-center gap-6 p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Snooze to Weekly</h4>
              <p className="text-xs text-slate-500 mt-1">Receive only one best-of-the-week digest.</p>
            </div>
          </button>

          <Link 
            href="/dashboard"
            className="flex items-center gap-6 p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Refine Categories</h4>
              <p className="text-xs text-slate-500 mt-1">Select only the categories you care about.</p>
            </div>
          </Link>

          <button 
            disabled={isPending || !emailInput}
            onClick={() => handleSubmit("NONE")}
            className="flex items-center gap-6 p-6 rounded-3xl border-2 border-red-50 bg-red-50/30 hover:bg-white hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">Unsubscribe from All</h4>
              <p className="text-xs text-slate-500 mt-1">Stop receiving all automated career updates.</p>
            </div>
          </button>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Powered by SeraHub Smart Match
        </p>
      </div>
    </div>
  );
}
