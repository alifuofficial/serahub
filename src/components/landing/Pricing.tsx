"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for casual job seekers",
    features: [
      "Access to all job listings",
      "Basic search filters",
      "Daily email notifications",
      "Up to 5 bookmarks",
    ],
    cta: "Get Started",
    href: "/auth/register",
    featured: false,
    color: "slate",
  },
  {
    name: "Pro Jobs",
    price: "199",
    description: "Designed for active professionals",
    features: [
      "AI-powered job matching",
      "Unlimited bookmarks",
      "Full CV Analysis (3/mo)",
      "Priority email alerts",
      "Ad-free experience",
    ],
    cta: "Go Pro Jobs",
    href: "/pricing",
    featured: true,
    color: "emerald",
  },
  {
    name: "Pro Bids",
    price: "499",
    description: "For serious business growth",
    features: [
      "Full access to all tenders",
      "Bid summarizer tool",
      "Document downloads",
      "Competitor insights",
      "API access (limited)",
    ],
    cta: "Go Pro Bids",
    href: "/pricing",
    featured: false,
    color: "orange",
  },
];

export default function Pricing() {
  return (
    <section className="py-16 bg-white relative">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50/50 to-transparent" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary mb-4">Pricing Plans</h2>
          <h3 className="text-3xl font-bold text-slate-900 mb-6">Choose the plan that fits <span className="gradient-text">your goals</span></h3>
          <p className="text-slate-500 text-lg">Simple, transparent pricing to help you take the next step in your professional journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-10 rounded-[40px] border transition-all duration-300 ${
                plan.featured 
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-emerald-900/20 scale-105 z-20" 
                  : "bg-white text-slate-900 border-slate-200 hover:border-primary/20 hover:shadow-xl shadow-sm z-10"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${plan.featured ? "text-emerald-400" : "text-primary"}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm font-bold ${plan.featured ? "text-slate-400" : "text-slate-400"}`}>ETB/month</span>
                </div>
                <p className={`mt-4 text-sm font-medium ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={plan.featured ? "text-emerald-400" : "text-primary"}><polyline points="20 6 9 17 4 12"/></svg>
                    <span className={plan.featured ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.href}
                className={`block w-full py-4 rounded-2xl text-center text-sm font-black transition-all ${
                  plan.featured 
                    ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20" 
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
