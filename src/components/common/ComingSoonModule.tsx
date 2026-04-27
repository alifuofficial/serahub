import React from "react";
import Link from "next/link";

interface Props {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function ComingSoonModule({ title, message, icon }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-bounce-slow">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"/><path d="m16.2 3.8 2.8 2.8"/><path d="M22 12h-4"/><path d="m18.2 16.2-2.8 2.8"/><path d="M12 22v-4"/><path d="m7.8 20.2-2.8-2.8"/><path d="M2 12h4"/><path d="m5.8 7.8 2.8-2.8"/><circle cx="12" cy="12" r="4"/>
          </svg>
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        {title} <span className="text-primary font-light italic">Coming Soon</span>
      </h1>
      <p className="text-lg text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
        {message || "We are currently building this feature to provide you with the best experience. Stay tuned for updates!"}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/" 
          className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200"
        >
          Back to Homepage
        </Link>
        <Link 
          href="/contact" 
          className="px-8 py-3.5 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Contact Support
        </Link>
      </div>
      
      <div className="mt-20 flex items-center gap-8 grayscale opacity-40">
         <span className="font-bold text-slate-400">SERAHUB AI</span>
         <span className="font-bold text-slate-400">SMART MATCH</span>
         <span className="font-bold text-slate-400">TENDER HUB</span>
      </div>
    </div>
  );
}
