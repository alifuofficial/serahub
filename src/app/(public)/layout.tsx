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
      where: { key: { in: ["site_name", "appearance_logo_url", "appearance_dark_logo_url", "maintenance_enabled", "maintenance_title", "maintenance_message"] } },
    }),
  ]);

  const config: Record<string, string> = {};
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  const maintenanceEnabled = config["maintenance_enabled"] === "true";
  const isAdmin = session?.role === "ADMIN";

  if (maintenanceEnabled && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg">
        Skip to content
      </a>
      <Navbar user={session ? { name: session.name, email: session.email, role: session.role } : null} siteName={config.site_name} logoUrl={config.appearance_logo_url} />
      <main id="main-content" className="flex-1">{children}</main>
      <VisitTracker />
      <Footer siteName={config.site_name} logoUrl={config.appearance_logo_url} />
    </>
  );
}