import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MaintenancePage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  if (isAdmin) {
    redirect("/");
  }

  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["maintenance_title", "maintenance_message", "site_name"] }
    }
  });
  const config: Record<string, string> = {};
  for (const c of configs) config[c.key] = c.value;

  const title = config.maintenance_title || "We'll be back soon!";
  const message = config.maintenance_message || "Our site is currently undergoing scheduled maintenance. Please check back shortly.";
  const siteName = config.site_name || "SeraHub";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">{title}</h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-8">{message}</p>

        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm font-semibold text-slate-600">Maintenance in progress</span>
        </div>

        <p className="text-xs text-slate-400 mt-8">{siteName} &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
