"use client";

import { useEffect } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSlot({ slot, format = "auto", style, className = "" }: AdSlotProps) {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  useEffect(() => {
    if (!enabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [enabled]);

  if (!enabled) {
    return (
      <div className={`bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-2"><rect x="2" y="3" width="20" height="18" rx="2" ry="2"/><line x1="2" x2="22" y1="10" y2="10"/><line x1="2" x2="22" y1="16" y2="16"/><line x1="10" x2="10" y1="3" y2="21"/><line x1="14" x2="14" y1="3" y2="21"/></svg>
        <span className="font-semibold text-slate-300">Advertisement</span>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style || { display: "block" }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}