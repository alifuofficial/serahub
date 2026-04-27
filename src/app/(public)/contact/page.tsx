import { Metadata } from "next";
import ContactForm from "@/components/common/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the SeraHub team. We are here to help with your questions, feedback, and partnership inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Us | SeraHub", description: "Get in touch with the SeraHub team.", url: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Have a question, feedback, or partnership inquiry? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-slate-200/80 rounded-2xl p-6 bg-white text-center">
          <div className="w-12 h-12 rounded-xl bg-[#e6fbf4] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Email</h3>
          <p className="text-sm text-slate-500">hello@serahub.click</p>
        </div>
        <div className="border border-slate-200/80 rounded-2xl p-6 bg-white text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Social Media</h3>
          <p className="text-sm text-slate-500">@serahub on all platforms</p>
        </div>
        <div className="border border-slate-200/80 rounded-2xl p-6 bg-white text-center">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Location</h3>
          <p className="text-sm text-slate-500">Remote-first, worldwide</p>
        </div>
      </div>

      <div className="border border-slate-200/80 rounded-2xl p-8 bg-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
        <ContactForm />
      </div>
    </div>
  );
}