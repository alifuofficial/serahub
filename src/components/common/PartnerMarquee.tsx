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
    <div className="w-full overflow-hidden py-10 relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
      
      <div className="flex animate-marquee whitespace-nowrap gap-16 items-center w-max">
        {doubledPartners.map((partner, idx) => (
          <div key={`${partner.id}-${idx}`} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-40 hover:opacity-100 px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-1.5 shadow-sm">
              <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-lg">{partner.name}</span>
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
