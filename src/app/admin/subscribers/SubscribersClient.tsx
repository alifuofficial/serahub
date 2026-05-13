"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSubscriberAction, triggerNewsletterAction } from "@/actions/subscribers";
import { logoutAction } from "@/actions/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  subscribers: SubscriberItem[];
}


export default function SubscribersClient({ user, subscribers }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleTriggerNewsletter = async () => {
    if (!confirm("This will generate a newsletter using AI and send it to ALL subscribers. Continue?")) return;
    setIsSending(true);
    setMsg(null);
    try {
      const result = await triggerNewsletterAction();
      if (result.error) {
        setMsg({ type: "error", text: result.error });
      } else {
        setMsg({ type: "success", text: result.message || "Newsletter sent successfully!" });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteSubscriberAction(fd);
      router.refresh();
    });
  };

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
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg><span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex">
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Subscribers" />
        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div><h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Subscribers</h1><p className="text-slate-500 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p></div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTriggerNewsletter} 
                  disabled={isSending || subscribers.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Send Weekly Newsletter
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Newsletter active
                </div>
              </div>
            </div>
            
            {msg && (
              <div className={`mb-6 p-4 rounded-xl border ${msg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"} flex items-start gap-3`}>
                {msg.type === "success" ? (
                  <svg className="mt-0.5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg className="mt-0.5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                )}
                <div className="text-sm font-medium">{msg.text}</div>
                <button onClick={() => setMsg(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Subscribed</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribers.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">No subscribers yet.</td></tr>
                    ) : subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00c087]/20 to-[#00e5a0]/20 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            </div>
                            <span className="text-sm font-medium text-slate-800">{s.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(s.id)} disabled={isPending} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Remove">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 0-2 1-2h6c1 0 1 1 1 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}