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
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Image src={logoUrl || "/logo.png"} alt={name} width={28} height={28} className="w-7 h-7 rounded-lg object-contain" />
              <span className="font-bold text-slate-800 text-lg">{name}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Discover the latest jobs, bids, and tender opportunities. Connecting professionals with career-defining roles.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">Platform</h3>
              <div className="flex flex-col gap-2">
                <Link href="/jobs" className="text-sm text-slate-500 hover:text-primary transition-colors">Jobs</Link>
                <Link href="/bids" className="text-sm text-slate-500 hover:text-primary transition-colors">Bids</Link>
                <Link href="/about" className="text-sm text-slate-500 hover:text-primary transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">Legal</h3>
              <div className="flex flex-col gap-2">
                <Link href="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">Support</h3>
              <div className="flex flex-col gap-2">
                <Link href="/contact" className="text-sm text-slate-500 hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#1877F2] hover:bg-[#1877F2]/5 transition-all" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {socials?.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#E4405F] hover:bg-[#E4405F]/5 transition-all" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            )}
            {socials?.tiktok && (
              <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-black hover:bg-black/5 transition-all" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            )}
            {socials?.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#0077B5] hover:bg-[#0077B5]/5 transition-all" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}