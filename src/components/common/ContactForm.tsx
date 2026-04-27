"use client";

import { useState } from "react";
import { submitContactAction } from "@/actions/contact";

export default function ContactForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await submitContactAction(fd);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Message sent!</h3>
        <p className="text-slate-500 text-sm">We will get back to you as soon as possible.</p>
        <button onClick={() => { setSent(false); }} className="mt-4 text-sm font-semibold text-primary hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="contact-name">Full name</label>
          <input type="text" id="contact-name" name="name" placeholder="Your name" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="contact-email">Email address</label>
          <input type="email" id="contact-email" name="email" placeholder="you@example.com" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="contact-subject">Subject</label>
        <select id="contact-subject" name="subject" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm">
          <option value="" disabled defaultValue="">Select a topic</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="partnership">Partnership</option>
          <option value="billing">Billing</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>

      {/* Honeypot field - hidden from users */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input type="text" name="hp_phone" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={5} placeholder="Tell us how we can help..." required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary px-8 py-3 text-base disabled:opacity-50">
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}