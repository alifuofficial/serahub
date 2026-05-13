"use client";

import { useEffect, useState } from "react";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  // Duplicate the list for seamless looping
  const doubledPartners = [...partners, ...partners];

  return (
    <div className="w-full overflow-hidden py-4 relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020806] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#020806] to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap gap-20 items-center w-max">
        {doubledPartners.map((partner, idx) => (
          <div key={`${partner.id}-${idx}`} className="flex items-center gap-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-30 hover:opacity-100 px-6 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5 transition-colors group-hover:bg-white/10">
              <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain brightness-0 invert" />
            </div>
            <span className="font-bold text-white/40 group-hover:text-white transition-colors tracking-tight text-base">{partner.name}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
