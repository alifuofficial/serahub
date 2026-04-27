"use client";

import Link from "next/link";
import { useState } from "react";
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
    aiCallCount: number;
    publishedJobs: number;
    publishedBids: number;
    draftJobs: number;
    draftBids: number;
    totalEmailClicks: number;
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
  dailyViewsData: { day: string; views: number; emailClicks: number }[];
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

export default function AdminDashboard({ user, stats, visitorStats, recentJobs, recentBids, categoryData, trendData, dailyViewsData, topPagesData, topReferrersData }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "bids">("jobs");
  const [chartView, setChartView] = useState<"category" | "trend">("trend");

  const statusData = [
    { name: "Jobs", value: stats.jobCount, color: "#00c087" },
    { name: "Bids", value: stats.bidCount, color: "#f59e0b" },
    { name: "Subs", value: stats.subscriberCount, color: "#3b82f6" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard <span className="text-primary">Overview</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring SeraHub performance and growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs" className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Manage Jobs
          </Link>
          <Link href="/admin/bids" className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            Manage Bids
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Reach", value: visitorStats.totalPageViews, sub: `${visitorStats.pageViewsToday} today`, icon: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", color: "text-violet-600", bg: "bg-violet-100/50" },
          { label: "Active Jobs", value: stats.publishedJobs, sub: `${stats.draftJobs} drafts`, icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z", color: "text-[#00c087]", bg: "bg-emerald-100/50" },
          { label: "Active Bids", value: stats.publishedBids, sub: `${stats.draftBids} drafts`, icon: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z", color: "text-amber-500", bg: "bg-amber-100/50" },
          { label: "Audience", value: stats.subscriberCount, sub: `${stats.totalEmailClicks} clicks`, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", color: "text-blue-600", bg: "bg-blue-100/50" },
        ].map((stat, i) => (
          <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={stat.icon}/></svg>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</h3>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Growth Analytics</h2>
              <p className="text-sm text-slate-500 font-medium">Detailed trends for content and users.</p>
            </div>
            <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl">
              <button onClick={() => setChartView("trend")} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${chartView === "trend" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Trends</button>
              <button onClick={() => setChartView("category")} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${chartView === "category" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Categories</button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "trend" ? (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00c087" stopOpacity={0.1}/><stop offset="95%" stopColor="#00c087" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dx={-15} />
                  <Tooltip contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "20px" }} labelStyle={{ fontWeight: 800, color: "#0f172a", marginBottom: "10px" }} />
                  <Area type="monotone" dataKey="jobs" stroke="#00c087" fillOpacity={1} fill="url(#colorJobs)" strokeWidth={4} />
                  <Area type="monotone" dataKey="bids" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBids)" strokeWidth={4} />
                </AreaChart>
              ) : (
                <BarChart data={categoryData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dx={-15} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "20px" }} />
                  <Bar dataKey="jobs" fill="#00c087" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="bids" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Distribution Panel */}
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white">
          <h2 className="text-xl font-black tracking-tight mb-8">Content Mix</h2>
          <div className="h-48 relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "16px", border: "none", color: "#000" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">{(stats.jobCount + stats.bidCount).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Units</span>
            </div>
          </div>

          <div className="space-y-6">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-sm font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic & Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-sm text-slate-500 font-medium">Latest entries across the platform.</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
              <button onClick={() => setActiveTab("jobs")} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "jobs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Jobs</button>
              <button onClick={() => setActiveTab("bids")} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeTab === "bids" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bids</button>
            </div>
          </div>

          <div className="p-4">
            {(activeTab === "jobs" ? recentJobs : recentBids).length > 0 ? (
              (activeTab === "jobs" ? recentJobs : recentBids).map((item: any) => (
                <Link key={item.id} href={`/admin/${activeTab}`} className="flex items-center gap-5 p-5 rounded-[24px] hover:bg-slate-50 group transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${activeTab === 'jobs' ? 'bg-emerald-50 text-[#00c087]' : 'bg-amber-50 text-amber-500'}`}>
                    {activeTab === 'jobs' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 truncate group-hover:text-primary transition-colors">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.source || 'N/A'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{item.views.toLocaleString()} views</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <p className="text-slate-400 font-bold">No activity found</p>
              </div>
            )}
          </div>
        </div>

        {/* Traffic Stats */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8">Traffic Sources</h3>
            <div className="space-y-5">
              {topReferrersData.slice(0, 5).map((ref, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                      {ref.referrer.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-600 truncate group-hover:text-slate-900 transition-colors">{ref.referrer}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{ref.visits.toLocaleString()}</span>
                </div>
              ))}
              {topReferrersData.length === 0 && <p className="text-sm text-slate-400 font-bold py-10 text-center">No referral data</p>}
            </div>
          </div>

          <div className="bg-primary p-8 rounded-[40px] shadow-lg shadow-primary/20 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-150 transition-transform duration-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2 relative z-10">AI Efficiency</h3>
            <p className="text-white/70 text-sm font-medium mb-8 relative z-10">Total AI-assisted content reviews and categorizations.</p>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-5xl font-black">{stats.aiCallCount.toLocaleString()}</span>
              <span className="text-sm font-black mb-2 uppercase tracking-widest opacity-60">Calls</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}