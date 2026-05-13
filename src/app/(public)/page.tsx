import Link from "next/link";
import Image from "next/image";
import JobCard from "@/components/ui/JobCard";
import BidCard from "@/components/ui/BidCard";
import SearchForm from "@/components/common/SearchForm";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Metadata } from "next";
import { getModuleStatus } from "@/lib/config";

export const metadata: Metadata = {
  title: "SeraHub - AI-Powered Job & Bid Platform",
  description: "Aggregating Ethiopia's most high-impact jobs and high-value bids. Driven by intelligence, built for your success.",
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

  const bookmarkedJobIds = new Set(userBookmarks.map(b => b.jobId).filter(Boolean));
  const bookmarkedBidIds = new Set(userBookmarks.map(b => b.bidId).filter(Boolean));

  return (
    <div className="bg-surface-50 text-gray-800 overflow-x-hidden min-h-screen">
      <OrganizationJsonLd />
      <WebSiteJsonLd />


      {/* Hero Section */}
      <section className="relative hero-bg overflow-hidden pt-12">
        <div className="absolute inset-0 grid-pattern-light"></div>
        
        {/* Subtle floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-brand-300/5 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-brand-200/8 rounded-full blur-2xl animate-float-slow"></div>

        {/* Decorative SVGs */}
        <svg className="absolute top-16 right-16 w-32 h-32 text-brand-300/15 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6"/>
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-28 lg:pb-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200/60 mb-6 shadow-sm">
                <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold tracking-widest uppercase text-brand-800">AI-Powered Match Engine Live</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.0] mb-5">
                <span className="text-gray-900">Find Your Next</span><br />
                <span className="gradient-text">Opportunity.</span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
                Aggregating Ethiopia's most <span className="text-gray-900 font-bold">high-impact jobs</span> and <span className="text-gray-900 font-bold">high-value bids</span>. Driven by intelligence, built for your success.
              </p>
            </div>

            {/* Search Bar */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full max-w-2xl">
              <SearchForm 
                variant="hero"
                placeholder="Find my next remote software job..."
                className="shadow-xl shadow-brand-500/10"
              />
              
              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-gray-500 font-bold">Try:</span>
                <Link href="/jobs?q=Remote" className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm font-medium">"Remote react jobs"</Link>
                <Link href="/bids?q=Construction" className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm font-medium">"Construction bids"</Link>
              </div>
            </div>

            {/* Browse Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link href="/jobs" className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Browse Jobs
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/bids" className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Explore Tenders
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-black tracking-[0.4em] uppercase text-brand-600/60 mb-10">Trusted by forward-thinking companies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-all group grayscale hover:grayscale-0">
                <img src={partner.logoUrl} alt={partner.name} className="h-8 w-auto object-contain" />
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-b from-surface-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active Jobs", value: 2500, color: "text-brand-600" },
              { label: "Daily Tenders", value: 150, color: "text-blue-500" },
              { label: "Users Joined", value: 10000, color: "text-purple-500" },
              { label: "Matches Made", value: 5000, color: "text-orange-500" },
            ].map((stat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 card-hover shadow-sm hover:shadow-md">
                <div className={`text-4xl font-black ${stat.color} tracking-tight`}>{stat.value.toLocaleString()}+</div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Industry Section */}
      <section className="relative py-24 bg-brand-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Browse by Industry</h2>
            <p className="text-gray-600 font-medium">Find exactly what you're looking for across our diverse categories</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button className="px-6 py-2.5 rounded-full bg-brand-100 text-brand-700 font-bold text-sm border border-brand-200">All</button>
            {["Technology", "Finance", "Construction", "Healthcare", "Education", "Agriculture"].map((cat) => (
              <button key={cat} className="px-6 py-2.5 rounded-full bg-white text-gray-600 font-bold text-sm border border-gray-100 hover:border-brand-200 hover:text-brand-600 transition-all">{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Technology", jobs: 320, icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "blue" },
              { name: "Finance", jobs: 280, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.67 2.57 1.63M12 8V7m0 11v1m0-1c-1.11 0-2.08-.67-2.57-1.63M12 18V7", color: "emerald" },
              { name: "Construction", jobs: 190, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "orange" },
              { name: "Healthcare", jobs: 150, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", color: "red" },
              { name: "Education", jobs: 120, icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", color: "purple" },
              { name: "Agriculture", jobs: 95, icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z", color: "yellow" },
            ].map((industry, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer group">
                <div className={`w-14 h-14 bg-${industry.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <svg className={`w-7 h-7 text-${industry.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={industry.icon}/>
                  </svg>
                </div>
                <h3 className="text-sm font-black text-gray-900 mb-1">{industry.name}</h3>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{industry.jobs}+ jobs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content (Jobs & Bids) */}
      <section className="py-24 bg-surface-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></div>
                Live Opportunities
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Featured Jobs</h2>
            </div>
            <Link href="/jobs" className="group flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors mt-4 sm:mt-0">
              View All Jobs
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobIds.has(job.id)} />
            ))}
          </div>

          <div className="pt-20 border-t border-gray-200/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  Active Tenders
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Recent Bids</h2>
              </div>
              <Link href="/bids" className="group flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors mt-4 sm:mt-0">
                Explore All Bids
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} isBookmarked={bookmarkedBidIds.has(bid.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-brand-600 mb-4">Pricing Plans</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              Choose the plan that fits <span className="gradient-text">your goals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              Simple, transparent pricing to help you take the next step in your professional journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {/* Free Plan */}
            <div className="p-8 rounded-[2rem] bg-white border border-gray-100 card-hover shadow-sm">
              <div className="mb-10">
                <h3 className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-4">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900">0</span>
                  <span className="text-sm font-bold text-gray-400">ETB/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {["Access to all listings", "Basic search filters", "Daily email alerts"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                    <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 px-6 text-sm font-black text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-1 bg-gradient-to-b from-brand-400 to-brand-600 rounded-[2.2rem] shadow-2xl shadow-brand-500/20">
              <div className="bg-white p-8 rounded-[2rem]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-600 rounded-full shadow-lg">Most Popular</span>
                </div>
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-4">Pro Jobs</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">199</span>
                    <span className="text-sm font-bold text-gray-400">ETB/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {["AI-powered matching", "Unlimited bookmarks", "Full CV Analysis (3/mo)", "Priority email alerts"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-800 font-bold">
                      <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-4 px-6 text-sm font-black text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/25">Go Pro Jobs</button>
              </div>
            </div>

            {/* Bids Plan */}
            <div className="p-8 rounded-[2rem] bg-white border border-gray-100 card-hover shadow-sm">
              <div className="mb-10">
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-4">Pro Bids</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900">499</span>
                  <span className="text-sm font-bold text-gray-400">ETB/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {["All Pro Jobs features", "Full tender documents", "Bid tracking & analytics", "Competitor intel"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 px-6 text-sm font-black text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">Go Pro Bids</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-brand-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white p-12 md:p-20 rounded-[3rem] border border-brand-100 text-center shadow-xl shadow-brand-500/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-brand-500"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Stay ahead of the curve</h2>
                <p className="text-gray-600 text-lg mb-12 max-w-lg mx-auto font-medium leading-relaxed">
                  Join 10,000+ professionals receiving curated opportunities every week. No spam, ever.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                   <div className="flex-1 relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <input type="email" placeholder="Enter your email address" className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white focus:border-brand-300 transition-all text-base font-bold text-gray-900" />
                   </div>
                   <button className="px-10 py-5 bg-brand-500 text-white font-black rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 text-lg">Subscribe</button>
                </form>
                <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Unsubscribe at any time.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}