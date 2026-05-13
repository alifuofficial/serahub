"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  jobsEnabled?: boolean;
  bidsEnabled?: boolean;
}

export default function Navbar({ user, siteName, logoUrl, jobsEnabled = true, bidsEnabled = true }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const name = siteName || "SeraHub";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">{name}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-full border border-brand-200/50">
              <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Home
            </Link>
            <Link href="/jobs" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 rounded-full hover:bg-white/50 transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Jobs
            </Link>
            <Link href="/bids" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 rounded-full hover:bg-white/50 transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Bids
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <SearchForm variant="nav" />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              {user ? (
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:scale-105 ${user.role === "ADMIN" ? "bg-gradient-to-br from-brand-500 to-brand-700" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-bold text-gray-700">{user.name || user.email.split('@')[0]}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-4 py-3 border-b border-gray-50 mb-2">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name || "User"}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                         </div>
                         <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            My Dashboard
                         </Link>
                         {user.role === "ADMIN" && (
                           <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                              Admin Panel
                           </Link>
                         )}
                         <div className="h-px bg-gray-50 my-2" />
                         <form action={logoutAction}>
                            <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                               Sign Out
                            </button>
                         </form>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Sign In</Link>
                  <Link href="/auth/register" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">Sign Up</Link>
                </div>
              )}
            </div>
            
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white animate-in slide-in-from-right duration-300">
           <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span className="text-xl font-black text-gray-900">{name}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
           </div>
           <div className="p-6 space-y-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block text-2xl font-black text-gray-900">Home</Link>
              <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block text-2xl font-black text-gray-500">Jobs</Link>
              <Link href="/bids" onClick={() => setMobileOpen(false)} className="block text-2xl font-black text-gray-500">Bids</Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-2xl font-black text-gray-500">About</Link>
           </div>
           <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">{(user.name || "U").charAt(0)}</div>
                      <div>
                         <p className="font-bold text-gray-900">{user.name}</p>
                         <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                   </div>
                   <form action={logoutAction}>
                      <button type="submit" className="p-2 text-red-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
                   </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link href="/auth/login" className="py-4 text-center font-bold text-gray-600 bg-gray-50 rounded-2xl">Sign In</Link>
                   <Link href="/auth/register" className="py-4 text-center font-bold text-white bg-brand-600 rounded-2xl">Sign Up</Link>
                </div>
              )}
           </div>
        </div>
      )}
    </nav>
  );
}