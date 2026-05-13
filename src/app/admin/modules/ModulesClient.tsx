"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { updateSettingsAction } from "@/actions/settings";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  config: Record<string, string>;
}

export default function ModulesClient({ user, config }: Props) {
  const [form, setForm] = useState(config);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    startTransition(async () => {
      const res = await updateSettingsAction(fd);
      if ("error" in res) {
        setMsg({ type: "error", text: res.error as string });
      } else {
        setMsg({ type: "success", text: "Modules updated successfully!" });
        setTimeout(() => setMsg({ type: "", text: "" }), 3000);
      }
    });
  };

  const modules = [
    {
      id: "cv_analyzer",
      name: "AI CV Analyzer",
      description: "Automated skill extraction and job matching from PDF resumes.",
      enabledKey: "cvanalyzer_enabled",
      priceKey: "cvanalyzer_price_etb",
      priceLabel: "Price per use (ETB)",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
    },
    {
      id: "bid_summarizer",
      name: "AI Bid Summarizer",
      description: "Generates concise AI summaries for complex tender documents.",
      enabledKey: "module_bid_summarizer_enabled",
      priceKey: "module_bid_summarizer_price",
      priceLabel: "Price per summary (ETB)",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
    },
    {
      id: "pro_job",
      name: "Job Seeker Pro Bundle",
      description: "Subscription bundle: Unlimited saves, early access, and free CV analysis.",
      enabledKey: "sub_pro_job_enabled",
      priceKey: "sub_pro_job_price",
      priceLabel: "Monthly Subscription (ETB)",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      id: "pro_bid",
      name: "Business Pro Bundle",
      description: "Subscription bundle: Tender downloads and AI Bid Summarizer access.",
      enabledKey: "sub_pro_bid_enabled",
      priceKey: "sub_pro_bid_price",
      priceLabel: "Monthly Subscription (ETB)",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M3 9h18"/><path d="M20 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16"/><path d="M12 21V9"/><path d="M7 21h10"/></svg>
    },
    {
      id: "ad_free",
      name: "Ad-Free Experience",
      description: "Completely removes advertisements from the platform for the user.",
      enabledKey: "module_ad_free_enabled",
      priceKey: "module_ad_free_price",
      priceLabel: "Monthly Fee (ETB)",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/><circle cx="12" cy="12" r="10"/></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="SeraHub" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-slate-800 text-lg hidden sm:inline">SeraHub</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg><span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Modules" />

        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modules Management</h1>
                <p className="text-slate-500 mt-2">Manage individual feature status and set prices for modular access.</p>
              </div>
              <button 
                onClick={handleSave} 
                disabled={isPending}
                className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Module Changes"}
              </button>
            </div>

            {msg.text && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msg.type === "success" ? "bg-[#e6fbf4] text-primary border border-primary/20" : "bg-red-50 text-red-600 border border-red-100"}`}>
                <span className="text-sm font-bold">{msg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner">
                        {mod.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{mod.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {mod.id}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={form[mod.enabledKey] === "true"}
                        onChange={(e) => update(mod.enabledKey, e.target.checked ? "true" : "false")}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{mod.priceLabel}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">ETB</span>
                      <input 
                        type="number" 
                        value={form[mod.priceKey] || "0"}
                        onChange={(e) => update(mod.priceKey, e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Free Trial Setting */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group col-span-1 md:col-span-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-20 group-hover:bg-white/10 transition-colors duration-500"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Free Trial Configuration</h3>
                    <p className="text-slate-400 text-sm max-w-md">Global free trial setting for newly registered users to test all modules.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-end lg:items-center">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Trial Status</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={form.sub_trial_enabled === "true"}
                          onChange={(e) => update("sub_trial_enabled", e.target.checked ? "true" : "false")}
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 text-sm font-bold text-white">{form.sub_trial_enabled === "true" ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Trial Days</label>
                      <input 
                        type="number" 
                        value={form.sub_trial_days || "7"}
                        onChange={(e) => update("sub_trial_days", e.target.value)}
                        className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
