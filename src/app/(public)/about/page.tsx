import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SeraHub",
  description: "Learn about SeraHub - the leading job and bid aggregator platform connecting professionals with opportunities in Ethiopia and beyond.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About SeraHub", description: "Learn about SeraHub - the leading job and bid aggregator platform connecting professionals with opportunities.", url: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">About SeraHub</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          SeraHub is the leading platform for discovering jobs, bids, and tender opportunities. We connect talented professionals with the organizations that need them.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            At SeraHub, our mission is to democratize access to professional opportunities. We believe that everyone deserves equal access to career-defining jobs and transformative projects, regardless of their background or location. Our platform aggregates opportunities from across the web, making it easy for you to find, track, and apply for the roles that match your skills and aspirations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200/80 rounded-2xl p-6 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#e6fbf4] flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Curated Jobs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Browse a wide range of job listings updated daily from trusted sources across multiple industries.</p>
            </div>
            <div className="border border-slate-200/80 rounded-2xl p-6 bg-white">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Active Tenders & Bids</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Find and track active tenders and bid opportunities with detailed descriptions and deadlines.</p>
            </div>
            <div className="border border-slate-200/80 rounded-2xl p-6 bg-white">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Smart Bookmarks</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Save opportunities to your personal collection and never lose track of the roles that matter most.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">For Employers & Organizations</h2>
          <p className="text-slate-600 leading-relaxed">
            SeraHub also serves organizations looking to reach qualified professionals. By listing your opportunities on our platform, you gain visibility among a curated audience of motivated candidates. Whether you are posting full-time positions, part-time contracts, or open tenders, SeraHub ensures your listing reaches the right people.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Values</h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg></div>
              <span><strong className="text-slate-800">Transparency:</strong> All listings are clear, accurate, and up-to-date.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg></div>
              <span><strong className="text-slate-800">Accessibility:</strong> Our platform is free and open to all professionals.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg></div>
              <span><strong className="text-slate-800">Privacy:</strong> We respect your data and handle it with the utmost care.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg></div>
              <span><strong className="text-slate-800">Quality:</strong> We curate listings to ensure relevance and legitimacy.</span>
            </li>
          </ul>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            Have questions, feedback, or partnership inquiries? We would love to hear from you. Visit our <a href="/contact" className="text-primary font-medium hover:underline">contact page</a> to get in touch.
          </p>
        </section>
      </div>
    </div>
  );
}