"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";
import SearchForm from "@/components/common/SearchForm";

interface NavbarUser {
  name: string | null;
  email: string;
  role: string;
}

interface NavbarProps {
  user: NavbarUser | null;
  siteName?: string;
  logoUrl?: string;
}

export default function Navbar({ user, siteName, logoUrl }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const name = siteName || "SeraHub";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} width={32} height={32} className="w-8 h-8 rounded-md object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">{name.charAt(0)}</div>
          )}
          <span className="font-bold text-xl tracking-tight text-slate-800">{name}</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-3xl items-center justify-center gap-6 px-10">
          <div className="flex gap-2">
            <Link href="/" className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            <Link href="/jobs" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Jobs
            </Link>
            <Link href="/bids" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              Bids
            </Link>
            <Link href="/about" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
              About
            </Link>
          </div>

          <SearchForm />
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === "ADMIN" ? "bg-gradient-to-br from-[#00c087] to-[#00e5a0]" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{user.name || user.email.split("@")[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "User"}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.role === "ADMIN" && <span className="inline-block mt-1 bg-[#e6fbf4] text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Admin</span>}
                    </div>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                      My Dashboard
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Admin Panel
                      </Link>
                    )}
                    <form action={logoutAction}>
                      <button type="submit" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Sign Out
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth/register" className="btn-primary py-2 px-5 text-sm">Sign Up</Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Home</Link>
            <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Jobs</Link>
            <Link href="/bids" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Bids</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">About</Link>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === "ADMIN" ? "bg-gradient-to-br from-[#00c087] to-[#00e5a0]" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "User"}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">My Dashboard</Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5">Admin Panel</Link>
                )}
                <form action={logoutAction}>
                  <button type="submit" className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">Sign Out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold text-slate-600 hover:text-primary">Sign In</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block w-full text-center btn-primary py-2.5 text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}