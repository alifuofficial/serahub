import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00c087" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 16-4-4"/><path d="m8 8 4 4"/><line x1="8" x2="16" y1="16" y2="8"/></svg>
      </div>
      <h1 className="text-6xl font-extrabold text-slate-900 mb-3">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary py-3 px-8 text-sm">
          Back to Home
        </Link>
        <Link href="/jobs" className="btn-secondary py-3 px-8 text-sm">
          Browse Jobs
        </Link>
        <Link href="/bids" className="btn-secondary py-3 px-8 text-sm">
          Browse Bids
        </Link>
      </div>
    </div>
  );
}