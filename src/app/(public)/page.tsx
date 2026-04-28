import Link from "next/link";
import JobCard from "@/components/ui/JobCard";
import BidCard from "@/components/ui/BidCard";
import AdSlot from "@/components/ads/AdSlot";
import NewsletterSection from "@/components/common/NewsletterSection";
import SearchForm from "@/components/common/SearchForm";
import PartnerMarquee from "@/components/common/PartnerMarquee";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SeraHub | Find Jobs & Bids in Ethiopia",
  description: "Discover the latest jobs, bids, and tender opportunities in Ethiopia. SeraHub connects professionals with top companies and government contracts.",
  keywords: ["jobs in Ethiopia", "Ethiopia tenders", "bids", "careers", "vacancies", "procurement", "freelance", "contract jobs"],
  alternates: { canonical: "/" },
};

export const revalidate = 60;

import { getModuleStatus } from "@/lib/config";

export default async function Home() {
  const session = await getSession();
  const { jobsEnabled, bidsEnabled } = await getModuleStatus();

  const [latestJobs, latestBids, userBookmarks, latest2Jobs, latest1Bid, partners, dbCategories] = await Promise.all([
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
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.bid.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    prisma.partner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 7
    })
  ]);

  const CATEGORIES = [
    { name: "All", slug: "all" },
    ...dbCategories.map(c => ({ name: c.name, slug: c.slug }))
  ];

  const heroItems = [
    ...latest2Jobs.map(j => ({ ...j, type: "JOB" })),
    ...latest1Bid.map(b => ({ ...b, type: "BID" })),
  ].slice(0, 3);

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));
  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <section className="relative pt-16 pb-12 overflow-hidden hero-mesh">
        <div className="absolute inset-0 hero-grid pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-40 right-[-10%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[80px] animate-float-delayed" />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="ai-badge mb-6 animate-fade-in-up inline-flex">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI-Driven Matching Engine Live
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 leading-[1.1]">
                Find Your Next<br/>
                <span className="gradient-text">Opportunity</span>
              </h1>

              <p className="text-base text-slate-500 mb-8 max-w-lg leading-relaxed">
                Aggregating the best jobs and bids across Ethiopia. Our smart engine connects you with the right opportunities, instantly.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/jobs" className="btn-primary text-sm px-6 py-3 gap-2 ai-glow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Browse Jobs
                </Link>
                <Link href="/bids" className="btn-secondary text-sm px-6 py-3 gap-2">
                  Explore Tenders
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>

              <SearchForm
                variant="hero"
                placeholder="Search jobs, projects, opportunities..."
                className="max-w-xl lg:mx-0 shadow-2xl shadow-primary/10 rounded-2xl"
              />
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl opacity-50 animate-pulse-soft" />
              <div className="ai-card rounded-[32px] p-6 lg:p-8 ai-scan-line relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900/40">Recent Pulse</h3>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/30" />)}
                  </div>
                </div>
                <div className="space-y-4">
                  {heroItems.map((item, idx) => (
                    <Link 
                      key={item.id}
                      href={item.type === "JOB" ? `/jobs/${item.slug}` : `/bids/${item.slug}`}
                      className="flex items-center gap-4 p-3.5 bg-white/60 hover:bg-white rounded-2xl border border-white/50 hover:border-primary/20 hover:shadow-xl transition-all group/hero"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        idx === 0 ? "bg-primary text-white" :
                        idx === 1 ? "bg-orange-400 text-white" :
                        "bg-violet-400 text-white"
                      }`}>
                        {item.type === "JOB" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate group-hover/hero:text-primary transition-colors">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{(item as any).company || item.source || "SeraHub"} · {item.type === "JOB" ? "Job" : "Bid"}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200 group-hover/hero:text-primary transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/40 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">{String.fromCharCode(64 + i)}</div>)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Members: <span className="text-slate-900">2,400+</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200/40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center lg:text-left">
              Aggregating data from trusted partners
            </p>
            <PartnerMarquee partners={partners} />
          </div>
        </div>
      </section>

      <section className="relative py-0 -mt-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="glass rounded-2xl px-6 py-5 mb-0">
            <div className="flex flex-wrap justify-center gap-2.5">
              {CATEGORIES.map((cat, i) => (
                <Link 
                  key={cat.slug} 
                  href={cat.slug === "all" ? "/jobs" : `/categories/${cat.slug}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${i === 0 ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary'}`}
                >
                  {i > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${i === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{(cat.name.charCodeAt(0) % 5) + 1}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Latest Jobs
                </h2>
                <div className="flex items-center gap-1.5 ml-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium ml-4">New opportunities waiting for you</p>
            </div>
            <Link href="/jobs" className="group flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          {jobsEnabled ? (
            latestJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <p className="text-slate-500 font-medium">No jobs available right now.</p>
                <p className="text-slate-400 text-sm mt-1">Check back soon for new opportunities.</p>
              </div>
            )
          ) : (
            <div className="relative group overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 p-12 text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse-soft"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Job Aggregator <span className="text-primary italic font-light">Coming Soon</span></h3>
              <p className="text-slate-500 max-w-sm mx-auto">We are building a smart AI engine to match you with the best jobs in Ethiopia.</p>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <AdSlot slot="home-mid" format="horizontal" className="w-full min-h-[90px]" />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-8 bg-orange-400 rounded-full" />
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Recent Bids
                </h2>
                <div className="flex items-center gap-1.5 ml-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium ml-4">Check out projects and active tenders</p>
            </div>
            <Link href="/bids" className="group flex items-center gap-2 text-orange-500 font-semibold text-sm hover:underline">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          {bidsEnabled ? (
            latestBids.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <p className="text-slate-500 font-medium">No bids available right now.</p>
                <p className="text-slate-400 text-sm mt-1">New tenders appear regularly.</p>
              </div>
            )
          ) : (
            <div className="relative group overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 p-12 text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 animate-pulse-soft"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Tender & Bid Hub <span className="text-orange-500 italic font-light">Coming Soon</span></h3>
              <p className="text-slate-500 max-w-sm mx-auto">Access the most comprehensive database of procurement opportunities and public tenders.</p>
            </div>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <AdSlot slot="home-bottom" format="horizontal" className="w-full min-h-[90px]" />
        </div>
      </section>

      <NewsletterSection heading="Never miss an opportunity" subheading="Get the latest jobs and bids delivered to your inbox every week. Join 2,400+ professionals who stay ahead." />
     </>
   );
 }