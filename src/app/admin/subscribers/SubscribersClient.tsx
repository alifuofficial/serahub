"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSubscriberAction, triggerNewsletterAction } from "@/actions/subscribers";

interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  subscribers: SubscriberItem[];
}

export default function SubscribersClient({ subscribers }: Props) {
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
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Newsletter <span className="text-primary">Subscribers</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{subscribers.length} active readers in your mailing list.</p>
        </div>
        <button 
          onClick={handleTriggerNewsletter} 
          disabled={isSending}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          {isSending ? "Generating & Sending..." : "Trigger AI Newsletter"}
        </button>
      </div>

      {msg && (
        <div className={`p-6 rounded-[24px] border ${msg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"} animate-in slide-in-from-top-2 duration-500`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === "success" ? "bg-emerald-500" : "bg-red-500"} text-white shadow-lg`}>
              {msg.type === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )}
            </div>
            <p className="text-sm font-bold tracking-tight">{msg.text}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subscribers.map((s) => (
                <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{s.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove Subscriber"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <p className="text-slate-400 font-bold">No subscribers yet</p>
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