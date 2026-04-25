import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  siteName?: string;
  logoUrl?: string;
}

export default function Footer({ siteName, logoUrl }: FooterProps) {
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
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}