"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import SocialLogins from "@/components/auth/SocialLogins";

interface RegisterClientProps {
  registrationDisabled?: boolean;
  googleEnabled?: boolean;
  facebookEnabled?: boolean;
  googleClientId?: string;
  facebookAppId?: string;
}

export default function RegisterClient({ 
  registrationDisabled, 
  googleEnabled, 
  facebookEnabled,
  googleClientId,
  facebookAppId
}: RegisterClientProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect() throws, which is expected
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 hero-mesh">
        <div className="absolute inset-0 hero-grid pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-violet-400/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/25">S</div>
            <span className="font-extrabold text-2xl tracking-tight text-white">SeraHub</span>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start your<br />
            <span className="gradient-text">journey today</span>
          </h2>
          <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-md">
            Create a free account to browse opportunities, submit bids, and connect with top employers.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Unlimited access to jobs & bids</p>
                <p className="text-white/50 text-xs">Browse thousands of curated opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Real-time notifications</p>
                <p className="text-white/50 text-xs">Never miss a deadline or new listing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bookmark & track applications</p>
                <p className="text-white/50 text-xs">Organize your career journey in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm shadow-primary/25">S</div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">SeraHub</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-slate-500 mt-2">Get started with your free SeraHub account.</p>
          </div>

          {registrationDisabled ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Disabled</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">New account registration is currently disabled by the administrator. Please try again later or contact us.</p>
              <div className="flex flex-col gap-3">
                <Link href="/contact" className="btn-primary w-full py-3 text-base text-center">Contact Us</Link>
                <Link href="/auth/login" className="w-full py-3 text-base text-center rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">Sign In</Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="name">Full name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <input type="text" id="name" name="name" placeholder="John Doe" required className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Email address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input type="email" id="email" name="email" placeholder="you@example.com" required className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input type="password" id="password" name="password" placeholder="Create a strong password" required minLength={6} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <div className="h-1 flex-1 rounded-full bg-slate-200" />
                    <div className="h-1 flex-1 rounded-full bg-slate-200" />
                    <div className="h-1 flex-1 rounded-full bg-slate-200" />
                    <div className="h-1 flex-1 rounded-full bg-slate-200" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="terms" name="terms" required className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
                  <label htmlFor="terms" className="text-sm text-slate-500 cursor-pointer select-none leading-relaxed">
                    I agree to the <a href="/terms" className="text-primary font-medium hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <SocialLogins 
                  googleEnabled={googleEnabled} 
                  facebookEnabled={facebookEnabled} 
                  googleClientId={googleClientId}
                  facebookAppId={facebookAppId}
                />
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}