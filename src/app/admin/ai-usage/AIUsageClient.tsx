"use client";

import dynamic from "next/dynamic";

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

export default function AIUsageClient({ logs, stats }: AIUsageProps) {
  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            AI <span className="text-primary">Intelligence</span> Usage
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring Gemini API consumption and health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-primary transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Interactions</p>
          <div className="flex items-end gap-3">
             <p className="text-4xl font-black text-slate-900 group-hover:text-primary transition-colors">{stats.totalCalls}</p>
             <div className="mb-1.5 flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
             </div>
          </div>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-violet-500 transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Model</p>
          <p className="text-3xl font-black text-slate-900 capitalize group-hover:text-violet-600 transition-colors truncate">
             {stats.providerBreakdown[0]?.provider || "Gemini"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Active Provider</p>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-amber-500 transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Health Index</p>
          <div className="flex items-baseline gap-2">
             <p className="text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                {stats.totalCalls > 0 ? Math.round((stats.successCount / stats.totalCalls) * 100) : 100}%
             </p>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
             <div 
               className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
               style={{ width: `${stats.totalCalls > 0 ? (stats.successCount / stats.totalCalls) * 100 : 100}%` }}
             />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200/50 p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">API Traffic Analytics</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 800, fill: "#cbd5e1" }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "24px", 
                  border: "none", 
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  padding: "16px",
                  fontWeight: 800,
                  fontSize: "12px"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#00c087" 
                strokeWidth={4} 
                fill="url(#colorUsage)" 
                animationDuration={2000}
              />
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c087" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00c087" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
           <h2 className="text-lg font-black text-slate-900 tracking-tight">Request Forensics</h2>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent 50 Logs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${log.provider === 'gemini' ? 'bg-primary shadow-[0_0_8px_rgba(0,192,135,0.5)]' : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]'}`} />
                       <span className="text-sm font-black text-slate-700 capitalize">{log.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.status}
                      </span>
                      {log.errorMessage && (
                        <p className="text-[10px] font-bold text-red-400/80 truncate max-w-[200px]" title={log.errorMessage}>{log.errorMessage}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-slate-500 transition-colors uppercase tracking-widest">
                      {log.model?.replace("models/", "") || "stable"}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                    <p className="text-slate-400 font-bold">No AI logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
