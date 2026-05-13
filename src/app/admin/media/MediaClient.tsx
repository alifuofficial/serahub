"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import MediaLibrary from "@/components/admin/MediaLibrary";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
}


export default function MediaClient({ user }: Props) {
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
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {user.email}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Media" />

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <div className="p-4 lg:p-8 flex-1 overflow-hidden flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Media Library</h1>
              <p className="text-slate-500 mt-1">Manage your images and documents in one place.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaLibrary />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
