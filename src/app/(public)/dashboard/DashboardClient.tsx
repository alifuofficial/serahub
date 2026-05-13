"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateProfileAction, removeBookmarkAction, updatePasswordAction, updateNewsletterPreferencesAction } from "@/actions/user";
import { logoutAction } from "@/actions/auth";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  newsletterFrequency: string | null;
  preferredCategories: { categoryId: string }[];
}

interface Bookmark {
  id: string;
  job?: { title: string; slug: string; source: string; category?: { name: string } } | null;
  bid?: { title: string; slug: string; source: string; category?: { name: string } } | null;
  createdAt: string;
}

interface Props {
  user: User;
  bookmarks: Bookmark[];
  allCategories: { id: string, name: string }[];
  cvAnalyzerConfig: { enabled: boolean; price: number };
  cvAnalysis: any;
}

type Tab = "overview" | "bookmarks" | "cvanalyzer" | "profile" | "newsletter";

export default function DashboardClient({ user, bookmarks, allCategories, cvAnalyzerConfig, cvAnalysis }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [mobileMenu, setMobileMenu] = useState(false);

  // CV Analyzer States
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(cvAnalysis);
  const [verifyRef, setVerifyRef] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const jobBookmarks = bookmarks.filter(b => b.job);
  const bidBookmarks = bookmarks.filter(b => b.bid);

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res.error) setMsg({ type: "profile-error", text: res.error });
      else {
        setMsg({ type: "profile-success", text: "Profile updated successfully!" });
        setTimeout(() => setMsg({ type: "", text: "" }), 3000);
      }
    });
  };

  const handleRemoveBookmark = (id: string) => {
    startTransition(async () => {
      await removeBookmarkAction(id);
    });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: "bookmarks", label: "My Bookmarks", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg> },
    ...(cvAnalyzerConfig.enabled ? [{ id: "cvanalyzer", label: "AI CV Analyzer", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg> }] : []),
    { id: "newsletter", label: "Newsletter", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
    { id: "profile", label: "Profile Settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#00e5a0] flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 text-lg">S</div>
            <span className="font-bold text-slate-800 text-xl tracking-tight">User Dashboard</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-emerald-400/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name || "User"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as Tab); setMobileMenu(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenu && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenu(false)} />}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="lg:hidden h-16 bg-white border-b border-slate-200/60 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">S</div>
             <span className="font-bold text-slate-800">SeraHub</span>
          </div>
          <button onClick={() => setMobileMenu(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </header>

        <div className="px-4 lg:px-10 py-8 lg:py-12 max-w-6xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Welcome back, <span className="gradient-text">{user.name || "User"}</span>!
                </h1>
                <p className="text-slate-500">Manage your saved jobs, bids, and profile preferences.</p>
              </div>

              {cvAnalyzerConfig.enabled && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
                  <div className="relative z-10 flex-1">
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
                      Supercharge Your Job Search
                    </h3>
                    <p className="text-blue-100 max-w-xl text-sm leading-relaxed">Let our AI analyze your CV to extract your core skills and match you with the perfect jobs automatically.</p>
                  </div>
                  <div className="relative z-10">
                    <button onClick={() => setActiveTab("cvanalyzer")} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform whitespace-nowrap">
                      {cvAnalysis ? "View Analysis" : "Analyze My CV"}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/60 p-7 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{jobBookmarks.length}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Saved Jobs</p>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200/60 p-7 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{bidBookmarks.length}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Saved Bids</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-emerald-500 rounded-3xl p-7 text-white shadow-xl shadow-primary/20">
                  <h3 className="text-lg font-bold mb-2">Get Updates</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">Stay informed about the latest opportunities that match your interests.</p>
                  <Link href="/jobs" className="inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                    Explore Jobs
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/60 p-8">
                 <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   Recent Activity
                 </h2>
                 {bookmarks.length > 0 ? (
                   <div className="space-y-4">
                     {bookmarks.slice(0, 5).map(b => (
                       <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                         <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.job ? "bg-[#e6fbf4] text-primary" : "bg-amber-50 text-amber-600"}`}>
                             {b.job ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                           </div>
                           <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">Bookmarked {b.job?.title || b.bid?.title}</p>
                             <p className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                           </div>
                         </div>
                         <Link href={b.job ? `/jobs/${b.job.slug}` : `/bids/${b.bid?.slug}`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                         </Link>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                     <p className="text-slate-400 text-sm">No recent activity. Start bookmarking jobs or bids!</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Bookmarks</h1>
                <p className="text-slate-500">Manage all your saved jobs and tender opportunities.</p>
              </div>

              <div className="space-y-10">
                <section>
                   <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Saved Jobs ({jobBookmarks.length})
                  </h2>
                  {jobBookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobBookmarks.map(b => (
                        <div key={b.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-start gap-4 group hover:shadow-lg transition-all">
                          <div className="w-12 h-12 rounded-xl bg-[#e6fbf4] flex items-center justify-center text-primary flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/jobs/${b.job?.slug}`} className="block text-sm font-bold text-slate-800 hover:text-primary transition-colors truncate">{b.job?.title}</Link>
                            <p className="text-xs text-slate-400 mt-0.5">{b.job?.source} · {b.job?.category?.name || "Uncategorized"}</p>
                            <div className="flex items-center gap-3 mt-4">
                              <Link href={`/jobs/${b.job?.slug}`} className="text-xs font-bold text-primary hover:underline">View Details</Link>
                              <button onClick={() => handleRemoveBookmark(b.id)} className="text-xs font-semibold text-slate-400 hover:text-red-500">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">You haven&apos;t saved any jobs yet.</p>
                    </div>
                  )}
                </section>

                <section>
                   <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    Saved Bids ({bidBookmarks.length})
                  </h2>
                  {bidBookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bidBookmarks.map(b => (
                        <div key={b.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-start gap-4 group hover:shadow-lg transition-all">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/bids/${b.bid?.slug}`} className="block text-sm font-bold text-slate-800 hover:text-amber-600 transition-colors truncate">{b.bid?.title}</Link>
                            <p className="text-xs text-slate-400 mt-0.5">{b.bid?.source} · {b.bid?.category?.name || "Uncategorized"}</p>
                             <div className="flex items-center gap-3 mt-4">
                              <Link href={`/bids/${b.bid?.slug}`} className="text-xs font-bold text-amber-600 hover:underline">View Details</Link>
                              <button onClick={() => handleRemoveBookmark(b.id)} className="text-xs font-semibold text-slate-400 hover:text-red-500">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">You haven&apos;t saved any bids yet.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Newsletter Preferences</h1>
                <p className="text-slate-500">Personalize your email updates and AI recommendations.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Email Updates</h2>
                      <p className="text-xs text-slate-400">Choose how often you want to hear from us.</p>
                    </div>
                  </div>

                  {msg.text && msg.type.includes("newsletter") && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${msg.type === "newsletter-success" ? "bg-[#e6fbf4] text-primary border border-primary/20" : "bg-red-50 text-red-600 border border-red-100"}`}>
                      {msg.type === "newsletter-success" ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>}
                      <span className="text-sm font-bold">{msg.text}</span>
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      startTransition(async () => {
                        const res = await updateNewsletterPreferencesAction(fd);
                        if (res.error) setMsg({ type: "newsletter-error", text: res.error });
                        else {
                          setMsg({ type: "newsletter-success", text: "Newsletter preferences saved!" });
                          setTimeout(() => setMsg({ type: "", text: "" }), 3000);
                        }
                      });
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4 ml-1">Frequency</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["DAILY", "WEEKLY", "NONE"].map((freq) => (
                          <label key={freq} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${user.newsletterFrequency === freq ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}>
                            <input type="radio" name="frequency" value={freq} defaultChecked={user.newsletterFrequency === freq} className="hidden" />
                            <span className="text-sm font-bold text-slate-800 capitalize">{freq.toLowerCase()}</span>
                            <span className="text-[10px] text-slate-400 mt-1">{freq === "DAILY" ? "Every morning" : freq === "WEEKLY" ? "Once a week" : "No emails"}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-4 ml-1">Interests & Categories</label>
                      <p className="text-xs text-slate-400 mb-4 ml-1">We&apos;ll prioritize these categories in your AI-curated newsletter.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {allCategories.map((cat) => {
                          const isPreferred = user.preferredCategories.some(pc => pc.categoryId === cat.id);
                          return (
                            <label key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/20 transition-all cursor-pointer group">
                              <input 
                                type="checkbox" 
                                name="categories" 
                                value={cat.id} 
                                defaultChecked={isPreferred}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-400/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">✨</span>
                        <h4 className="text-sm font-bold text-slate-800">Smart Personalization</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        We automatically refine your recommendations based on your activity to ensure you only receive the most relevant job and bid updates.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button disabled={isPending} className="w-full sm:w-auto btn-primary px-8 py-3 font-bold text-sm disabled:opacity-50">
                        {isPending ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Profile Settings</h1>
                <p className="text-slate-500">Manage your account information and how you appear on the site.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden mb-8">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                  </div>
                  
                  {msg.text && msg.type.includes("profile") && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${msg.type === "profile-success" ? "bg-[#e6fbf4] text-primary border border-primary/20" : "bg-red-50 text-red-600 border border-red-100"}`}>
                      {msg.type === "profile-success" ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>}
                      <span className="text-sm font-bold">{msg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-primary/20">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Profile Picture</h4>
                        <p className="text-sm text-slate-400">Avatar is generated from your initial.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                        <input name="name" type="text" defaultValue={user.name || ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all" placeholder="Enter your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                        <input name="email" type="email" defaultValue={user.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all" placeholder="you@example.com" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button disabled={isPending} className="w-full sm:w-auto btn-primary px-8 py-3 font-bold text-sm disabled:opacity-50">
                        {isPending ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Security</h2>
                  </div>

                  {msg.text && msg.type.includes("password") && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${msg.type === "password-success" ? "bg-[#e6fbf4] text-primary border border-primary/20" : "bg-red-50 text-red-600 border border-red-100"}`}>
                      {msg.type === "password-success" ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>}
                      <span className="text-sm font-bold">{msg.text}</span>
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      startTransition(async () => {
                        const res = await updatePasswordAction(fd);
                        if (res.error) setMsg({ type: "password-error", text: res.error });
                        else {
                          setMsg({ type: "password-success", text: "Password changed successfully!" });
                          (e.target as HTMLFormElement).reset();
                          setTimeout(() => setMsg({ type: "", text: "" }), 3000);
                        }
                      });
                    }} 
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Current Password</label>
                      <input name="currentPassword" type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all" placeholder="••••••••" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">New Password</label>
                        <input name="newPassword" type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Confirm New Password</label>
                        <input name="confirmPassword" type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all" placeholder="••••••••" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button disabled={isPending} className="w-full sm:w-auto btn-primary px-8 py-3 font-bold text-sm disabled:opacity-50">
                        {isPending ? "Updating..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cvanalyzer" && cvAnalyzerConfig.enabled && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">AI CV Analyzer</h1>
                <p className="text-slate-500">Upload your CV to extract your skills and get matched with relevant jobs.</p>
              </div>

              {!currentAnalysis && (
                <div className="bg-white rounded-3xl border border-slate-200/60 p-10 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Upload your CV</h3>
                  <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">Please upload a PDF version of your resume. Our AI will analyze your experience and match you with the best opportunities.</p>
                  
                  <label className="inline-flex items-center gap-2 btn-primary px-8 py-3.5 rounded-xl cursor-pointer">
                    {uploading ? "Uploading..." : "Select PDF File"}
                    <input 
                      type="file" 
                      accept="application/pdf"
                      className="hidden" 
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/user/upload-cv", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.cvAnalysisId) {
                            window.location.reload(); // Refresh to load the new state
                          } else {
                            alert(data.error || "Failed to upload CV");
                          }
                        } catch (err) {
                          alert("Upload failed.");
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {currentAnalysis && currentAnalysis.status === "PENDING" && currentAnalysis.transactionStatus !== "SUCCESS" && (
                <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{currentAnalysis.fileName}</h3>
                        <p className="text-sm text-slate-500">Uploaded on {new Date(currentAnalysis.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => {
                        if(confirm("Are you sure you want to discard this CV and upload a new one?")) {
                          // Ideally delete the record, but for now just clear local state to re-upload
                          setCurrentAnalysis(null);
                        }
                      }} className="text-sm text-red-500 font-semibold hover:underline">Discard
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Payment Required</h4>
                      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        To unlock the AI analysis and get your personalized job matches, please complete the payment of <strong className="text-slate-900">{cvAnalyzerConfig.price} ETB</strong>.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-4">
                          <img src="/telebirr.png" alt="Telebirr" className="h-8 object-contain" onError={(e) => (e.currentTarget.style.display="none")} />
                          <div>
                            <p className="font-bold text-emerald-900">Pay via Telebirr</p>
                            <p className="text-xs text-emerald-700">Account: 0911223344</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 flex items-center gap-4">
                          <img src="/cbe.png" alt="CBE" className="h-8 object-contain" onError={(e) => (e.currentTarget.style.display="none")} />
                          <div>
                            <p className="font-bold text-purple-900">Pay via CBE</p>
                            <p className="text-xs text-purple-700">Account: 100011223344</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                      <h4 className="font-bold text-slate-900 mb-4">Verify Payment</h4>
                      <p className="text-xs text-slate-500 mb-4">After paying, enter your Transaction Reference Number below to instantly unlock your analysis.</p>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={verifyRef} 
                          onChange={e => setVerifyRef(e.target.value)} 
                          placeholder="e.g. FT123456789" 
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button 
                          disabled={verifyLoading || !verifyRef}
                          onClick={async () => {
                            setVerifyLoading(true);
                            try {
                              // We simulate calling the verifyet API and triggering webhook
                              // In a real flow, we'd create the Transaction first, then submit Verification
                              const res = await fetch("/api/user/verify-cv-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ reference: verifyRef, cvAnalysisId: currentAnalysis.id })
                              });
                              if (res.ok) {
                                alert("Verification submitted. Waiting for confirmation...");
                                window.location.reload();
                              } else {
                                const data = await res.json();
                                alert(data.error || "Verification failed");
                              }
                            } catch (e) {
                              alert("An error occurred");
                            } finally {
                              setVerifyLoading(false);
                            }
                          }}
                          className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                          {verifyLoading ? "Verifying..." : "Verify & Unlock"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentAnalysis && (currentAnalysis.status === "PENDING" || currentAnalysis.status === "FAILED") && currentAnalysis.transactionStatus === "SUCCESS" && (
                <div className="bg-white rounded-3xl border border-slate-200/60 p-10 text-center shadow-xl shadow-slate-200/20">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                     <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Payment Verified!</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Your payment was successful. Our AI is ready to analyze your CV and find the best job matches for you.</p>
                  
                  {currentAnalysis.status === "FAILED" && <p className="text-red-500 font-bold mb-4">Previous analysis failed. Try again.</p>}

                  <button 
                    disabled={analyzing}
                    onClick={async () => {
                      setAnalyzing(true);
                      try {
                        const res = await fetch("/api/user/cv-analyze", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ cvAnalysisId: currentAnalysis.id })
                        });
                        if (res.ok) {
                          window.location.reload();
                        } else {
                          const data = await res.json();
                          alert(data.error || "Analysis failed");
                        }
                      } catch (e) {
                        alert("An error occurred");
                      } finally {
                        setAnalyzing(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {analyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        Start AI Analysis
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentAnalysis && currentAnalysis.status === "COMPLETED" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-20"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Analysis Complete</h3>
                      <p className="text-slate-500">We've extracted your profile details and found jobs that match your skills.</p>
                    </div>
                    <div className="relative z-10">
                       <button onClick={() => {
                          if(confirm("Are you sure you want to upload a new CV? You will need to pay for a new analysis.")) {
                            setCurrentAnalysis(null);
                          }
                        }} className="btn-outline px-6 py-2 rounded-lg text-sm bg-white">
                        Upload New CV
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                       <div className="bg-white rounded-3xl border border-slate-200/60 p-8">
                         <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                           Top Skills Detected
                         </h4>
                         <div className="flex flex-wrap gap-2">
                           {currentAnalysis.skills?.map((skill: string, i: number) => (
                             <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">{skill}</span>
                           ))}
                         </div>
                       </div>
                       
                       <div className="bg-white rounded-3xl border border-slate-200/60 p-8">
                         <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                           Experience Summary
                         </h4>
                         <p className="text-slate-600 leading-relaxed text-sm">{currentAnalysis.experience}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20">
                         <h4 className="font-bold mb-4 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#00e5a0]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                           Matched Jobs
                         </h4>
                         <p className="text-sm text-slate-300 mb-6">Based on your skills, these are the top recommended opportunities.</p>
                         
                         <div className="space-y-3">
                           {currentAnalysis.matchedJobs?.length > 0 ? currentAnalysis.matchedJobs.map((job: any) => (
                             <Link key={job.id} href={`/jobs/${job.slug}`} className="block p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5">
                               <p className="font-bold text-sm truncate">{job.title}</p>
                               {job.company && <p className="text-xs text-slate-400 mt-1 truncate">{job.company}</p>}
                             </Link>
                           )) : (
                             <div className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                               <p className="text-sm text-slate-400">No direct matches found right now. Check back later!</p>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
