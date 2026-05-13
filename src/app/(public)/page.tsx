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
      <section className="relative pt-32 pb-40 overflow-hidden bg-[#0a0f1d]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Match Engine Live
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Find Your Next<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500">Opportunity.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Aggregating Ethiopia's most high-impact jobs and high-value bids. 
              Driven by intelligence, built for your success.
            </p>

            <div className="max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <SearchForm 
                variant="hero" 
                placeholder="Search jobs, tenders, or AI-powered matching..."
                className="shadow-2xl shadow-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <Link href="/jobs" className="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                Browse Jobs
              </Link>
              <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
              <Link href="/bids" className="flex items-center gap-2 text-sm font-bold text-white hover:text-orange-400 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-400/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                Explore Tenders
              </Link>
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