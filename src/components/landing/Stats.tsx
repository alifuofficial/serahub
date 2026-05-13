"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Active Jobs", value: "2,500+", color: "text-emerald-500" },
  { label: "Daily Tenders", value: "150+", color: "text-blue-500" },
  { label: "Users Joined", value: "10,000+", color: "text-purple-500" },
  { label: "Matches Made", value: "5,000+", color: "text-orange-500" },
];

export default function Stats() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm shadow-slate-100/50"
            >
              <div className={`text-4xl lg:text-5xl font-black mb-3 ${stat.color} tracking-tight`}>
                {stat.value}
              </div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
