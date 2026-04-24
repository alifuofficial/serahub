"use client";

import { useState, useEffect } from "react";
import AdSlot from "@/components/ads/AdSlot";

interface DownloadCountdownProps {
  fileId: string;
  fileName: string;
  filePath: string;
  bidTitle: string;
  countdownSeconds?: number;
}

export default function DownloadCountdown({ fileId, fileName, filePath, bidTitle, countdownSeconds = 15 }: DownloadCountdownProps) {
  const [seconds, setSeconds] = useState(countdownSeconds);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setReady(true);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setReady(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = filePath;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progress = ((countdownSeconds - seconds) / countdownSeconds) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Download File</h1>
          <p className="text-slate-500">{bidTitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 text-lg truncate">{fileName}</p>
              <p className="text-sm text-slate-500">Your download will begin automatically</p>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {ready ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-[#e6fbf4] text-primary px-4 py-2 rounded-xl text-sm font-bold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Ready to download!
              </div>
              <button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl text-base transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Now
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg mb-1">Please wait <span className="text-orange-500">{seconds}</span> seconds</p>
              <p className="text-sm text-slate-400">Your download link is being prepared...</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <AdSlot slot="download-top" format="horizontal" className="w-full min-h-[90px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <AdSlot slot="download-mid-left" format="rectangle" style={{ minHeight: "250px" }} className="rounded-2xl overflow-hidden" />
          <AdSlot slot="download-mid-right" format="rectangle" style={{ minHeight: "250px" }} className="rounded-2xl overflow-hidden" />
        </div>

        <div className="mb-6">
          <AdSlot slot="download-bottom" format="horizontal" className="w-full min-h-[90px]" />
        </div>

        {!ready && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-500">While you wait, consider subscribing to get notified about new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}