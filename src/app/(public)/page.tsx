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
import Counter from "@/components/landing/Counter"; // I'll create this or use a simple version

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
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-700">AI-Powered Match Engine Live</span>
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
              <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
                Aggregating Ethiopia's most <span className="text-gray-700 font-medium">high-impact jobs</span> and <span className="text-gray-700 font-medium">high-value bids</span>. Driven by intelligence, built for your success.
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
                <span className="text-xs text-gray-400">Try:</span>
                <Link href="/jobs?q=Remote" className="px-3 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm">"Remote react jobs"</Link>
                <Link href="/bids?q=Construction" className="px-3 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-all shadow-sm">"Construction bids"</Link>
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
      <section className="relative py-10 border-b border-gray-100 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase text-brand-600/50 mb-8">Trusted by forward-thinking companies</p>
          <div className="relative overflow-hidden">
            <div className="marquee gap-16">
              {[...partners, ...partners].map((partner, idx) => (
                <div key={`${partner.id}-${idx}`} className="flex items-center gap-3 flex-shrink-0 opacity-40 hover:opacity-100 transition-all group">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-2 group-hover:bg-white group-hover:shadow-sm">
                    <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0" />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 whitespace-nowrap">{partner.name}</span>
                </div>
              ))}
            </div>
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
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SeraHub Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-brand-600 mb-4">Why SeraHub?</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              Everything you need to <span className="gradient-text">accelerate</span> your career
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We've built a powerful ecosystem that combines raw data with cutting-edge AI to give you an unfair advantage in the market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "AI-Powered Matching", desc: "Our advanced algorithms match your skills and preferences with the most relevant jobs and bids automatically.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", color: "brand" },
              { title: "Real-time Tenders", desc: "Get instant access to government and private sector bids from across Ethiopia, categorized and searchable.", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "blue" },
              { title: "CV Analysis", desc: "Upload your CV and let our AI analyze your strengths, suggesting the perfect roles and improvements.", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "purple" },
              { title: "Smart Notifications", desc: "Never miss an opportunity with personalized email alerts and web notifications tailored to your profile.", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0", color: "orange" },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white border border-gray-100 card-hover shadow-sm hover:shadow-lg">
                <div className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <svg className={`w-7 h-7 text-${feature.color === 'brand' ? 'brand-600' : feature.color + '-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon}/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
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
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
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
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 px-6 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">Get Started</button>
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
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 px-6 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">Go Pro Bids</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-brand-50 to-brand-100 p-12 md:p-20 rounded-[3rem] border border-brand-200/50 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-200/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Stay ahead of the curve</h2>
                <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto font-medium">Join 10,000+ professionals receiving curated opportunities every week.</p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                   <input type="email" placeholder="Enter your email address" className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium" />
                   <button className="px-8 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">Subscribe</button>
                </form>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}