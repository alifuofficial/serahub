"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMessageReadAction, deleteMessageAction } from "@/actions/contact";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  messages: MessageItem[];
}

const subjectLabels: Record<string, string> = {
  general: "General Inquiry",
  support: "Technical Support",
  partnership: "Partnership",
  billing: "Billing",
  feedback: "Feedback",
};

export default function MessagesClient({ messages }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleMarkRead = (id: string) => {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await markMessageReadAction(fd);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this message?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteMessageAction(fd);
      router.refresh();
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            User <span className="text-primary">Inquiries</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{messages.length} submissions {unreadCount > 0 && `· ${unreadCount} new`}</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-200/50 p-20 text-center flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             </div>
             <p className="text-slate-400 font-bold">Inbox is empty</p>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`bg-white rounded-[32px] border transition-all duration-500 overflow-hidden ${
                m.read 
                  ? "border-slate-100 opacity-80" 
                  : "border-primary/20 shadow-xl shadow-primary/5"
              }`}
            >
              <button 
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} 
                className="w-full px-8 py-6 flex items-start gap-5 text-left"
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-black shadow-lg ${
                  m.read 
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-primary text-white shadow-primary/20"
                }`}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-black text-slate-900 text-sm tracking-tight group-hover:text-primary transition-colors">{m.name}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.email}</span>
                    {!m.read && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest animate-pulse">
                         New Message
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {m.subject && (
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {subjectLabels[m.subject] || m.subject}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${m.read ? "text-slate-400" : "text-slate-600"} line-clamp-1`}>{m.message}</p>
                </div>
                <div className={`mt-4 transform transition-transform duration-500 ${expandedId === m.id ? "rotate-180" : ""}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </button>
              
              {expandedId === m.id && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="border-t border-slate-50 pt-6 space-y-6">
                    <div className="p-8 rounded-[24px] bg-slate-50/50 text-sm font-medium text-slate-700 leading-relaxed italic border border-slate-100">
                      "{m.message}"
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-4">
                      {!m.read && (
                        <button 
                          onClick={() => handleMarkRead(m.id)} 
                          disabled={isPending} 
                          className="px-6 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <a 
                        href={`mailto:${m.email}`} 
                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                      >
                        Send Reply
                      </a>
                      <button 
                        onClick={() => handleDelete(m.id)} 
                        disabled={isPending} 
                        className="ml-auto p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}