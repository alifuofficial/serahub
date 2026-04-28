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
}

type Tab = "overview" | "bookmarks" | "profile" | "newsletter";

export default function DashboardClient({ user, bookmarks, allCategories }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [mobileMenu, setMobileMenu] = useState(false);

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
                        <span className="text-xl">🤖</span>
                        <h4 className="text-sm font-bold text-slate-800">AI Learning Enabled</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        By using the platform, our AI learns your behavior (searches and views) to automatically refine these recommendations even further.
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
        </div>
      </main>
    </div>
  );
}
