import Link from "next/link";
import Image from "next/image";
import JobCard from "@/components/ui/JobCard";
import BidCard from "@/components/ui/BidCard";
import AdSlot from "@/components/ads/AdSlot";
import NewsletterSection from "@/components/common/NewsletterSection";
import SearchForm from "@/components/common/SearchForm";
import PartnerMarquee from "@/components/common/PartnerMarquee";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Stats from "@/components/landing/Stats";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Metadata } from "next";
import { getModuleStatus } from "@/lib/config";

export const metadata: Metadata = {
  title: "SeraHub | AI-Powered Job & Bid Intelligence Platform",
  description: "Accelerate your career with Ethiopia's most advanced job and bid aggregator. AI-powered matching, real-time tenders, and professional insights.",
  keywords: ["jobs in Ethiopia", "Ethiopia tenders", "bids", "AI job matching", "CV analysis", "vacancies", "procurement"],
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default async function Home() {
  const session = await getSession();
  const { jobsEnabled, bidsEnabled } = await getModuleStatus();

  const [latestJobs, latestBids, userBookmarks, partners, dbCategories] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.bid.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    session ? prisma.bookmark.findMany({
      where: { userId: session.id },
      select: { jobId: true, bidId: true }
    }) : Promise.resolve([]),
    prisma.partner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 8
    })
  ]);

  const CATEGORIES = [
    { name: "All", slug: "all" },
    ...dbCategories.map(c => ({ name: c.name, slug: c.slug }))
  ];

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));
  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  return (
    <div className="overflow-x-hidden">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#0a0f1d]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Opportunity Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Your Professional Future,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500">Accelerated by AI.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Ethiopia's most comprehensive platform for high-impact jobs and high-value bids. Engineered for the ambitious professional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/auth/register" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl text-base font-black shadow-2xl shadow-primary/40 hover:bg-primary-dark transition-all transform hover:-translate-y-1">
                Start Your Free Trial
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl text-base font-black hover:bg-white/10 transition-all">
                Explore Opportunities
              </Link>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[32px] blur-2xl opacity-50" />
            <div className="relative rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/saas_dashboard_mockup.png" 
                alt="SeraHub Dashboard" 
                width={1200} 
                height={800} 
                className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
            
            {/* Floating elements for SaaS feel */}
            <div className="absolute -top-10 -right-10 hidden lg:block animate-float">
              <div className="glass-dark p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Score</p>
                    <p className="text-xl font-black text-white">98.5%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 hidden lg:block animate-float-delayed">
              <div className="glass-dark p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-5-5 5"/><path d="m17 19-5 5-5-5"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tenders Analyzed</p>
                    <p className="text-xl font-black text-white">12.4k</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-[#0a0f1d] border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 text-center">Trusted by forward-thinking companies</p>
          <PartnerMarquee partners={partners} />
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Features Section */}
      <Features />

      {/* Category Explorer */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Browse by Industry</h2>
            <p className="text-slate-500">Find exactly what you're looking for across our diverse categories</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link 
                key={cat.slug} 
                href={cat.slug === "all" ? "/jobs" : `/categories/${cat.slug}`}
                className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections (Jobs & Bids) */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Opportunities
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900">Featured Jobs</h2>
            </div>
            <Link href="/jobs" className="flex items-center gap-2 text-primary font-black text-sm hover:translate-x-1 transition-transform">
              View All Jobs
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
            ))}
          </div>

          <div className="py-12 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Active Tenders
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900">Recent Bids</h2>
              </div>
              <Link href="/bids" className="flex items-center gap-2 text-orange-500 font-black text-sm hover:translate-x-1 transition-transform">
                Explore All Bids
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      <NewsletterSection 
        heading="Stay ahead of the curve" 
        subheading="Join 10,000+ professionals receiving curated opportunities every week." 
      />
    </div>
  );
}