"use client";

import { logoutAction } from "@/actions/auth";

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: { email: string };
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="flex items-center justify-between h-20 px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 font-medium bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            System Online
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">Administrator</p>
            <p className="text-xs font-medium text-slate-400 leading-none">{user.email}</p>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />

          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-500 transition-all px-4 py-2.5 rounded-2xl hover:bg-red-50 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span className="hidden md:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
