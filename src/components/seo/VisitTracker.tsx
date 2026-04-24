"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/api")) return;

    const tracked = sessionStorage.getItem(`vt:${pathname}`);
    if (tracked) return;
    sessionStorage.setItem(`vt:${pathname}`, "1");

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
        country: "",
      }),
      }).catch(() => {});
  }, [pathname]);

  return null;
}