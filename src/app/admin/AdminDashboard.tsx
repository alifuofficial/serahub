"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });

interface RecentJob {
  id: string;
  title: string;
  slug: string;
  source: string;
  category: string | null;
  views: number;
  status: string;
  createdAt: string;
}

interface RecentBid {
  id: string;
  title: string;
  slug: string;
  source: string;
  views: number;
  status: string;
  deadline: string | null;
  createdAt: string;
}

interface DashboardProps {
  user: { id: string; email: string; name: string | null; role: string };
  stats: {
    jobCount: number;
    bidCount: number;
    categoryCount: number;
    userCount: number;
    subscriberCount: number;
    publishedJobs: number;
    publishedBids: number;
    draftJobs: number;
    draftBids: number;
  };
  totalViews: number;
  visitorStats: {
    totalPageViews: number;
    pageViewsToday: number;
    pageViewsYesterday: number;
    pageViewsLast7Days: number;
    pageViewsLast30Days: number;
    uniqueVisitors7d: number;
    uniqueVisitors30d: number;
  };
  recentJobs: RecentJob[];
  recentBids: RecentBid[];
  categoryData: { name: string; jobs: number; bids: number }[];
  trendData: { month: string; jobs: number; bids: number; subscribers: number }[];
  dailyViewsData: { day: string; views: number }[];
  topPagesData: { path: string; views: number }[];
  topReferrersData: { referrer: string; visits: number }[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatPath(path: string) {
  if (path === "/") return "Homepage";
  return path.length > 35 ? path.substring(0, 35) + "..." : path;
}

export default function AdminDashboard({ user, stats, totalViews, visitorStats, recentJobs, recentBids, categoryData, trendData, dailyViewsData, topPagesData, topReferrersData }: DashboardProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "bids">("jobs");
  const [chartView, setChartView] = useState<"category" | "trend">("trend");

  const navItems = [
    { label: "Overview", href: "/admin", active: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { label: "Jobs", href: "/admin/jobs", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { label: "Bids", href: "/admin/bids", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: "Partners", href: "/admin/partners", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg> },
    { label: "Users", href: "/admin/users", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: "Categories", href: "/admin/categories", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg> },
    { label: "Subscribers", href: "/admin/subscribers", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
    { label: "Messages", href: "/admin/messages", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: "Settings", href: "/admin/settings", active: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg> },
  ];

  const statCards = [
    { label: "Total Jobs", value: stats.jobCount, sub: `${stats.publishedJobs} published, ${stats.draftJobs} drafts`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, gradient: "from-[#00c087] to-[#00e5a0]" },
    { label: "Total Bids", value: stats.bidCount, sub: `${stats.publishedBids} published, ${stats.draftBids} drafts`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>, gradient: "from-amber-500 to-orange-400" },
    { label: "Page Views", value: visitorStats.totalPageViews, sub: `${visitorStats.pageViewsToday} today`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, gradient: "from-violet-500 to-purple-500" },
    { label: "Subscribers", value: stats.subscriberCount, sub: "Email subscribers", icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, gradient: "from-blue-500 to-cyan-500" },
  ];

  const statusData = [
    { name: "Published Jobs", value: stats.publishedJobs, color: "#00c087" },
    { name: "Draft Jobs", value: stats.draftJobs, color: "#86efac" },
    { name: "Published Bids", value: stats.publishedBids, color: "#f59e0b" },
    { name: "Draft Bids", value: stats.draftBids, color: "#fde68a" },
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00c087] to-[#00e5a0] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/25">S</div>
              <span className="font-bold text-slate-800 text-lg hidden sm:inline">SeraHub</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{user.email}
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-[#00e5a0]/10 text-primary text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Admin
            </div>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg><span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 pb-4"><div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c087] to-[#00e5a0] flex items-center justify-center text-white font-bold text-sm">{(user.name || "A").charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{user.name || "Admin"}</p><p className="text-[11px] text-slate-400 truncate">{user.email}</p></div></div></div>
            <nav className="px-4 space-y-1 flex-1">{navItems.map((item) => (<Link key={item.label} href={item.href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${item.active ? "bg-gradient-to-r from-primary/10 to-[#00e5a0]/10 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{item.icon}{item.label}</Link>))}</nav>
            <div className="p-4 border-t border-slate-100"><Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Back to Site</Link></div>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, <span className="gradient-text">{user.name || "Admin"}</span></h1>
                <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening on SeraHub today.</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.07] rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-150 transition-transform duration-700`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm`}>{stat.icon}</div>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value.toLocaleString()}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Visitor Analytics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Today</p>
                <p className="text-2xl font-extrabold text-slate-900">{visitorStats.pageViewsToday.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">page views</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Yesterday</p>
                <p className="text-2xl font-extrabold text-slate-900">{visitorStats.pageViewsYesterday.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">page views</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last 7 Days</p>
                <p className="text-2xl font-extrabold text-slate-900">{visitorStats.pageViewsLast7Days.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">{visitorStats.uniqueVisitors7d} unique pages</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last 30 Days</p>
                <p className="text-2xl font-extrabold text-slate-900">{visitorStats.pageViewsLast30Days.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">{visitorStats.uniqueVisitors30d} unique pages</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Content Analytics</h2>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    <button onClick={() => setChartView("trend")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartView === "trend" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Trends</button>
                    <button onClick={() => setChartView("category")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartView === "category" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>By Category</button>
                  </div>
                </div>
                {chartView === "trend" ? (
                  <>
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#00c087]" />Jobs</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f59e0b]" />Bids</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3b82f6]" />Subscribers</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={trendData} barGap={4} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} labelStyle={{ fontWeight: 600, color: "#0f172a" }} />
                        <Bar dataKey="jobs" fill="#00c087" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="bids" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="subscribers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#00c087]" />Jobs</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f59e0b]" />Bids</span>
                    </div>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={categoryData} barGap={4} barCategoryGap="20%">
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} labelStyle={{ fontWeight: 600, color: "#0f172a" }} />
                          <Bar dataKey="jobs" fill="#00c087" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="bids" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No category data yet</div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Content Status</h2>
                {(stats.publishedJobs + stats.draftJobs + stats.publishedBids + stats.draftBids) > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} strokeWidth={0}>
                        {statusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No content yet</div>
                )}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#00c087]" />Published Jobs ({stats.publishedJobs})</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />Draft Jobs ({stats.draftJobs})</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />Published Bids ({stats.publishedBids})</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#fde68a]" />Draft Bids ({stats.draftBids})</div>
                </div>
              </div>
            </div>

            {/* Page Views Chart + Top Pages + Top Referrers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Daily Page Views (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyViewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} dot={{ r: 4, fill: "#8b5cf6" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    Top Pages
                  </h3>
                  {topPagesData.length > 0 ? (
                    <div className="space-y-2.5">
                      {topPagesData.slice(0, 5).map((p, i) => (
                        <div key={p.path} className="flex items-center justify-between">
                          <span className="text-sm text-slate-700 truncate max-w-[180px]" title={p.path}>{formatPath(p.path)}</span>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No page views yet</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Top Referrers
                  </h3>
                  {topReferrersData.length > 0 ? (
                    <div className="space-y-2.5">
                      {topReferrersData.slice(0, 5).map((r) => (
                        <div key={r.referrer} className="flex items-center justify-between">
                          <span className="text-sm text-slate-700 truncate max-w-[160px]">{r.referrer}</span>
                          <span className="text-xs font-semibold text-slate-500 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{r.visits.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No referrers yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-8">
              {[
                { href: "/admin/jobs", label: "Manage Jobs", gradient: "from-[#00c087] to-[#00e5a0]", shadowColor: "shadow-primary/20", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
                { href: "/admin/bids", label: "Manage Bids", gradient: "from-amber-500 to-orange-400", shadowColor: "shadow-amber-500/20", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { href: "/admin/categories", label: "Categories", gradient: "from-violet-500 to-purple-500", shadowColor: "shadow-violet-500/20", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg> },
                { href: "/admin/users", label: "Manage Users", gradient: "from-blue-500 to-cyan-500", shadowColor: "shadow-blue-500/20", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              ].map((action) => (
                <a key={action.label} href={action.href} className={`relative overflow-hidden flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 ${action.shadowColor} hover:shadow-lg transition-all duration-300 group`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>{action.icon}</div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                </a>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button onClick={() => setActiveTab("jobs")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "jobs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Jobs ({stats.jobCount})</button>
                  <button onClick={() => setActiveTab("bids")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "bids" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bids ({stats.bidCount})</button>
                </div>
              </div>

              {activeTab === "jobs" ? (
                <div className="divide-y divide-slate-100">
                  {recentJobs.length > 0 ? recentJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c087]/10 to-[#00e5a0]/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{job.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {job.category && <span className="text-xs text-slate-400">{job.category}</span>}
                          {job.category && <span className="text-slate-300">·</span>}
                          <span className="text-xs text-slate-400">{job.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{job.views}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${job.status === "PUBLISHED" ? "bg-[#e6fbf4] text-primary" : "bg-slate-100 text-slate-500"}`}>{job.status === "PUBLISHED" ? "Live" : job.status}</span>
                        <span className="text-xs text-slate-400">{formatDate(job.createdAt)}</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="px-6 py-12 text-center text-slate-400 text-sm">No jobs yet</div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentBids.length > 0 ? recentBids.map((bid) => (
                    <Link key={bid.id} href={`/bids/${bid.slug}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{bid.title}</p>
                        <span className="text-xs text-slate-400">{bid.source}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{bid.views}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${bid.status === "PUBLISHED" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{bid.status === "PUBLISHED" ? "Live" : bid.status}</span>
                        <span className="text-xs text-slate-400">{formatDate(bid.createdAt)}</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="px-6 py-12 text-center text-slate-400 text-sm">No bids yet</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}