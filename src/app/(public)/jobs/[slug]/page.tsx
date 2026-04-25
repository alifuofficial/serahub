import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";
import NewsletterSection from "@/components/common/NewsletterSection";
import EditorJSRenderer, { getPlainText } from "@/components/editor/Renderer";
import { JobPostingJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { getSession } from "@/lib/session";
import BookmarkButton from "@/components/common/BookmarkButton";
import SocialShare from "@/components/common/SocialShare";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findUnique({ where: { slug }, include: { category: true } });
  
  if (!job) return { title: "Not Found" };
  
  const desc = job.metaDescription || getPlainText(job.description).substring(0, 160);
  const keywords = job.keywords ? job.keywords.split(", ") : [job.title, job.category?.name, "jobs", "careers", "Ethiopia", "opportunities"].filter(Boolean) as string[];
  
  return {
    title: job.title,
    description: desc,
    keywords: keywords,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: job.title,
      description: desc,
      url: `/jobs/${job.slug}`,
      type: "article",
      publishedTime: job.createdAt.toISOString(),
      modifiedTime: job.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: job.title,
      description: desc,
    },
  };
}

export default async function JobDetailPage({ params }: Params) {
  const { slug } = await params;
  const session = await getSession();
  const job = await prisma.job.findUnique({
    where: { slug },
    include: { category: true, _count: { select: { bookmarks: true } } }
  });

  if (!job) return notFound();

  // Increment views
  await prisma.job.update({
    where: { id: job.id },
    data: { views: { increment: 1 } }
  });

  const isBookmarked = session ? await prisma.bookmark.findFirst({
    where: { userId: session.id, jobId: job.id }
  }).then(b => !!b) : false;
  
  return (
    <div className="min-h-screen">
      <JobPostingJsonLd
        title={job.title}
        description={getPlainText(job.description)}
        datePosted={job.createdAt.toISOString()}
        validThrough={job.deadline?.toISOString()}
        hiringOrganization={job.source || undefined}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://serahub.com" },
        { name: "Jobs", url: "https://serahub.com/jobs" },
        { name: job.title, url: `https://serahub.com/jobs/${job.slug}` },
      ]} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 pt-8 pb-0 relative z-10 max-w-6xl">
          <nav className="mb-8 text-sm font-medium flex items-center gap-2">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="m9 18 6-6-6-6"/></svg>
            <Link href="/jobs" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Jobs
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-slate-700 truncate max-w-[200px]">{job.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="bg-[#e6fbf4] text-primary px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              JOB
            </span>
            <span className="bg-yellow-50 text-yellow-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Featured
            </span>
            {job.category && <span className="bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold">{job.category.name}</span>}
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">OPEN</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {job.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-primary/20">SH</div>
              <div>
                <p className="text-sm font-bold text-slate-800">SeraHub</p>
                <p className="text-xs text-slate-400">{job.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-primary/10 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            </div>
            <BookmarkButton id={job.id} type="JOB" initialIsBookmarked={isBookmarked} />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <SocialShare title={job.title} />
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="group border border-slate-200/80 rounded-2xl p-5 bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#e6fbf4] flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Salary / Pay</p>
                  <p className="font-bold text-slate-800 text-lg">Competitive</p>
                </div>
              </div>
              <div className="group border border-slate-200/80 rounded-2xl p-5 bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#e6fbf4] flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Deadline</p>
                  <p className="font-bold text-slate-800">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                  </p>
                </div>
              </div>
              <div className="group border border-slate-200/80 rounded-2xl p-5 bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#e6fbf4] flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Source</p>
                  <p className="font-bold text-slate-800">{job.source || 'Varied Location'}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                Description
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed overflow-hidden break-words">
                <EditorJSRenderer content={job.description} />
              </div>
            </div>

            <div className="my-8">
              <AdSlot slot="job-incontent" format="horizontal" className="w-full min-h-[90px]" />
            </div>
          </div>

<div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="overflow-hidden rounded-2xl">
                <AdSlot slot="job-sidebar" format="rectangle" style={{ minHeight: "250px" }} />
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-3">
                <BookmarkButton id={job.id} type="JOB" initialIsBookmarked={isBookmarked} showText={true} />
                {session ? (
                  job.applyLink ? (
                    <a 
                      href={job.applyLink.includes("@") && !job.applyLink.startsWith("mailto:") ? `mailto:${job.applyLink}` : job.applyLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full btn-primary font-bold text-sm py-3.5 justify-center text-center"
                    >
                      {job.applyLink.includes("@") ? "Apply via Email" : "Apply for Job"}
                    </a>
                  ) : (
                    <span className="w-full inline-flex items-center justify-center gap-2 text-slate-400 font-bold text-sm py-3.5 rounded-full border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                      No application link
                    </span>
                  )
                ) : (
                  <div className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-[#e6fbf4]/50 p-4 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Sign in to view application link</p>
                    <p className="text-xs text-slate-500">Create a free account or sign in to apply for this job.</p>
                    <div className="flex gap-2 pt-1">
                      <Link href="/auth/login" className="flex-1 btn-primary text-sm py-2.5 font-bold text-center">Sign In</Link>
                      <Link href="/auth/register" className="flex-1 inline-flex items-center justify-center text-sm py-2.5 font-bold rounded-full border border-slate-200 hover:border-primary/30 hover:bg-[#e6fbf4]/50 transition-all">Sign Up</Link>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium mt-2">
                  <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {Math.floor(job.views / 5) + 1} Applicants</span>
                  <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> {job._count.bookmarks} Saves</span>
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-br from-[#e6fbf4]/50 to-white shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold shadow-sm shadow-primary/20">SH</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">SeraHub</p>
                  <span className="bg-[#e6fbf4] text-primary px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1 inline-block">Official · Jobs</span>
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-br from-[#e6fbf4]/30 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">Get notified</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">Receive similar jobs directly in your inbox.</p>
                <form className="flex flex-col gap-2">
                  <input type="email" placeholder="you@example.com" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                  <button type="submit" className="btn-primary py-2.5 text-xs">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewsletterSection variant="green" heading="Get more jobs like this" subheading="Subscribe to receive personalized job recommendations and never miss an opportunity that matches your skills." />
    </div>
  );
}