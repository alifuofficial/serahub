import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  siteName?: string;
  logoUrl?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
  };
}

export default function Footer({ siteName, logoUrl, socials }: FooterProps) {
  const name = siteName || "SeraHub";

  return (
    <footer className="relative bg-white border-t border-gray-100 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50 -mr-48 -mb-48 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 lg:gap-20">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">{name}</span>
            </Link>
            <p className="text-sm text-gray-700 font-medium leading-relaxed max-w-xs">
              Ethiopia's premier AI-powered platform for career acceleration. Discover high-impact jobs and high-value tenders in one unified hub.
            </p>
            <div className="flex items-center gap-4 mt-8">
              {socials?.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
              )}
              {socials?.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {socials?.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/jobs" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Jobs</Link></li>
              <li><Link href="/bids" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Bids</Link></li>
              <li><Link href="/about" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} {name}. Built for the future of work.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] px-3 py-1 bg-brand-50 rounded-full">v1.0.4 - Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}