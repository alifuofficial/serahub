"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our advanced algorithms match your skills and preferences with the most relevant jobs and bids automatically.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 16a4 4 0 1 0 4 4 4 4 0 0 0-4-4Z"/><path d="M12 8a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"/><path d="M16 12a4 4 0 1 0 4-4 4 4 0 0 0-4 4Z"/><path d="M8 12a4 4 0 1 0-4 4 4 4 0 0 0 4-4Z"/></svg>
    ),
    color: "bg-emerald-500/10",
  },
  {
    title: "Real-time Tenders",
    description: "Get instant access to government and private sector bids from across Ethiopia, categorized and searchable.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
    ),
    color: "bg-blue-500/10",
  },
  {
    title: "CV Analysis",
    description: "Upload your CV and let our AI analyze your strengths, suggesting the perfect roles and improvements.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M7 10h10"/><path d="M7 14h10"/><path d="M7 18h5"/></svg>
    ),
    color: "bg-purple-500/10",
  },
  {
    title: "Smart Notifications",
    description: "Never miss an opportunity with personalized email alerts and web notifications tailored to your profile.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    ),
    color: "bg-orange-500/10",
  },
];

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Why SeraHub?</h2>
          <h3 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
            Everything you need to <span className="gradient-text">accelerate</span> your career
          </h3>
          <p className="text-slate-500 text-lg leading-relaxed">
            We've built a powerful ecosystem that combines raw data with cutting-edge AI to give you an unfair advantage in the market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[32px] bg-white border border-slate-200/60 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
