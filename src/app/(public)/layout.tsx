import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitTracker from "@/components/seo/VisitTracker";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MaintenancePage from "./maintenance/page";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, configRows] = await Promise.all([
    getSession(),
    prisma.siteConfig.findMany({
      where: { 
        key: { 
          in: [
            "site_name", 
            "appearance_logo_url", 
            "appearance_dark_logo_url", 
            "maintenance_enabled", 
            "maintenance_title", 
            "maintenance_message",
            "coming_soon_enabled",
            "coming_soon_title",
            "coming_soon_message",
            "social_link_facebook",
            "social_link_instagram",
            "social_link_tiktok",
            "social_link_linkedin"
          ] 
        } 
      },
    }),
  ]);

  const config: Record<string, string> = {};
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  const maintenanceEnabled = config["maintenance_enabled"] === "true";
  const comingSoonEnabled = config["coming_soon_enabled"] === "true";
  const isAdmin = session?.role === "ADMIN";
  const logoUrl = config["appearance_logo_url"];
  const socials = {
    facebook: config["social_link_facebook"],
    instagram: config["social_link_instagram"],
    tiktok: config["social_link_tiktok"],
    linkedin: config["social_link_linkedin"],
  };

  if (maintenanceEnabled && !isAdmin) {
    return <MaintenancePage />;
  }

  if (comingSoonEnabled && !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center p-5">
              <img src={logoUrl || "/logo.png"} alt={config.site_name} className="w-full h-full object-contain" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {config["coming_soon_title"] || "Something Big is Coming!"}
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                {config["coming_soon_message"] || "We are working hard to bring you a better experience. Stay tuned!"}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-1 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="bg-white rounded-xl p-6 shadow-sm">
                 <p className="text-sm font-bold text-slate-800 mb-4">Notify me when we launch</p>
                 <form action="/api/subscribe" method="POST" className="flex gap-2">
                   <input type="email" name="email" placeholder="your@email.com" required className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                   <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">Notify Me</button>
                 </form>
               </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold uppercase tracking-widest border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Under Construction
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              {socials.facebook && <a href={socials.facebook} className="text-slate-400 hover:text-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>}
              {socials.instagram && <a href={socials.instagram} className="text-slate-400 hover:text-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>}
              {socials.tiktok && <a href={socials.tiktok} className="text-slate-400 hover:text-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>}
              {socials.linkedin && <a href={socials.linkedin} className="text-slate-400 hover:text-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>}
            </div>
            <p className="text-sm font-semibold text-slate-400">© {new Date().getFullYear()} {config.site_name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg">
        Skip to content
      </a>
      <Navbar user={session ? { name: session.name, email: session.email, role: session.role } : null} siteName={config.site_name} logoUrl={config.appearance_logo_url} />
      <main id="main-content" className="flex-1">{children}</main>
      <VisitTracker />
      <Footer siteName={config.site_name} logoUrl={config.appearance_logo_url} socials={socials} />
    </>
  );
}