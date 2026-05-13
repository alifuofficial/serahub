"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import dynamic from "next/dynamic";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface AIUsageLog {
  id: string;
  provider: string;
  model: string | null;
  type: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface AIUsageProps {
  user: { id: string; email: string; name: string | null; role: string };
  logs: AIUsageLog[];
  stats: {
    totalCalls: number;
    successCount: number;
    errorCount: number;
    typeBreakdown: { type: string; count: number }[];
    providerBreakdown: { provider: string; count: number }[];
    dailyUsage: { day: string; count: number }[];
  };
}

export default function AIUsageClient({ user, logs, stats }: AIUsageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);


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
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="AI Usage" />

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0 px-4 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI API Usage</h1>
            <p className="text-slate-500 mt-1">Track your AI model consumption and costs.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Total AI Calls</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalCalls}</p>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500" />{stats.successCount} Success</span>
                <span className="flex items-center gap-1.5 text-red-500 font-bold"><span className="w-2 h-2 rounded-full bg-red-500" />{stats.errorCount} Errors</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Top Provider</p>
              <p className="text-3xl font-extrabold text-slate-900 capitalize">{stats.providerBreakdown[0]?.provider || "N/A"}</p>
              <p className="text-xs text-slate-400 mt-2">{stats.providerBreakdown[0]?.count || 0} calls to this provider</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">Most Used Type</p>
              <p className="text-3xl font-extrabold text-slate-900 capitalize">{stats.typeBreakdown[0]?.type || "N/A"}</p>
              <p className="text-xs text-slate-400 mt-2">{stats.typeBreakdown[0]?.count || 0} occurrences</p>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Daily API Calls</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fill="url(#colorUsage)" />
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Recent API Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 capitalize">
                          <div className={`w-2 h-2 rounded-full ${log.provider === 'gemini' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                          {log.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {log.status === 'SUCCESS' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                          )}
                          {log.status}
                        </span>
                        {log.errorMessage && <p className="text-[10px] text-red-400 mt-1 truncate max-w-[200px]" title={log.errorMessage}>{log.errorMessage}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {log.model || "-"}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
