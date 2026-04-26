"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtpAction, sendOtpAction } from "@/actions/auth";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("code", code);

    startTransition(async () => {
      const res = await verifyOtpAction(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      }
    });
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    const res = await sendOtpAction(email);
    setIsResending(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setError("New code sent!");
    }
  };

  if (!email) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
        <Link href="/auth/login" className="text-primary hover:underline">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
          <p className="text-slate-500 mt-2">We've sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span></p>
        </div>

        {success ? (
          <div className="bg-[#e6fbf4] border border-primary/20 p-4 rounded-xl text-center">
            <p className="text-primary font-bold">Email Verified!</p>
            <p className="text-sm text-primary/80 mt-1">Redirecting you to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[10px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                required
              />
              {error && <p className={`mt-2 text-sm font-medium ${error.includes("sent") ? "text-primary" : "text-red-500"}`}>{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending || code.length !== 6}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
            >
              {isPending ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                {isResending ? "Sending..." : "Didn't receive a code? Resend"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
