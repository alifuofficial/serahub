"use client";

import React, { useState, useTransition } from "react";
import { updateSettingsAction, resetViewsAction, deleteDraftsAction, testSmtpAction } from "@/actions/settings";
import ImageUpload from "@/components/common/ImageUpload";

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  config: Record<string, string>;
}

type Section = "general" | "seo" | "smtp" | "ads" | "appearance" | "storage" | "ai" | "maintenance" | "social" | "danger";

const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg> },
  { id: "seo", label: "SEO & Meta", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> },
  { id: "smtp", label: "SMTP / Email", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  { id: "ai", label: "AI Config", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> },
  { id: "maintenance", label: "Availability", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg> },
  { id: "social", label: "Social", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { id: "danger", label: "Danger Zone", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${checked ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200"}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-sm font-black text-slate-900 tracking-tight">{label}</label>
        {hint && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsClient({ user, config }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDrafts, setConfirmDrafts] = useState(false);
  const [dangerMsg, setDangerMsg] = useState("");
  const [testEmail, setTestEmail] = useState(user.email);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error" | "none", msg: string }>({ type: "none", msg: "" });
  const [isTesting, setIsTesting] = useState(false);

  const [form, setForm] = useState(config);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(false);
    const fd = new FormData();
    for (const [key, value] of Object.entries(form)) {
      fd.set(key, value);
    }
    startTransition(async () => {
      await updateSettingsAction(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const handleTestSmtp = async () => {
    setIsTesting(true);
    setTestStatus({ type: "none", msg: "" });
    const result = await testSmtpAction(testEmail);
    setIsTesting(false);
    if (result.success) {
      setTestStatus({ type: "success", msg: "Email sent successfully!" });
    } else {
      setTestStatus({ type: "error", msg: result.error || "Failed to send test email." });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            System <span className="text-primary">Settings</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Configure SeraHub core parameters and branding.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl animate-bounce">
              Changes Saved!
            </span>
          )}
          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="px-8 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3.5 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${
                activeSection === s.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className={activeSection === s.id ? "text-primary" : "text-slate-400"}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 lg:p-12 min-h-[600px] animate-in zoom-in-95 duration-500">
            
            {activeSection === "general" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {sections.find(s => s.id === "general")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">General Branding</h2>
                    <p className="text-sm text-slate-500 font-medium">Basic information about your site.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormRow label="Site Name">
                    <input type="text" value={form.site_name || ""} onChange={(e) => update("site_name", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                  </FormRow>
                  <FormRow label="Site Tagline">
                    <input type="text" value={form.site_tagline || ""} onChange={(e) => update("site_tagline", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                  </FormRow>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormRow label="Support Email">
                    <input type="email" value={form.support_email || ""} onChange={(e) => update("support_email", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                  </FormRow>
                  <FormRow label="Contact Phone">
                    <input type="text" value={form.contact_phone || ""} onChange={(e) => update("contact_phone", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                  </FormRow>
                </div>

                <FormRow label="Footer Text">
                  <textarea rows={3} value={form.footer_text || ""} onChange={(e) => update("footer_text", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all resize-none" />
                </FormRow>
              </div>
            )}

            {activeSection === "seo" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    {sections.find(s => s.id === "seo")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">SEO Optimization</h2>
                    <p className="text-sm text-slate-500 font-medium">Control how your site appears in search engines.</p>
                  </div>
                </div>

                <FormRow label="Meta Description" hint="Max 160 characters">
                  <textarea rows={4} value={form.meta_description || ""} onChange={(e) => update("meta_description", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all resize-none" />
                </FormRow>

                <FormRow label="Meta Keywords" hint="Comma separated">
                  <input type="text" value={form.meta_keywords || ""} onChange={(e) => update("meta_keywords", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                </FormRow>

                <div className="p-8 rounded-3xl bg-slate-900 text-white overflow-hidden relative group">
                  <div className="relative z-10">
                    <h4 className="font-black mb-1">Search Preview</h4>
                    <p className="text-xs text-slate-400 mb-4">{form.site_name} — {form.site_tagline}</p>
                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{form.meta_description || "No description set yet."}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:scale-150 transition-transform duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "smtp" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    {sections.find(s => s.id === "smtp")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">SMTP Server</h2>
                    <p className="text-sm text-slate-500 font-medium">Used for system notifications and newsletters.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormRow label="SMTP Host">
                    <input type="text" value={form.smtp_host || ""} onChange={(e) => update("smtp_host", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                  </FormRow>
                  <FormRow label="SMTP Port">
                    <input type="text" value={form.smtp_port || ""} onChange={(e) => update("smtp_port", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                  </FormRow>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormRow label="SMTP User">
                    <input type="text" value={form.smtp_user || ""} onChange={(e) => update("smtp_user", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                  </FormRow>
                  <FormRow label="SMTP Password">
                    <input type="password" value={form.smtp_pass || ""} onChange={(e) => update("smtp_pass", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                  </FormRow>
                </div>

                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Connection Test</h4>
                  <div className="flex gap-4">
                    <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Recipient email" className="flex-1 px-5 py-3 rounded-xl bg-white border border-blue-200 text-sm font-bold text-slate-900 focus:outline-none" />
                    <button 
                      onClick={handleTestSmtp} 
                      disabled={isTesting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {isTesting ? "Testing..." : "Send Test"}
                    </button>
                  </div>
                  {testStatus.type !== "none" && (
                    <p className={`mt-4 text-xs font-bold ${testStatus.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{testStatus.msg}</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {sections.find(s => s.id === "ai")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">AI Intelligence</h2>
                    <p className="text-sm text-slate-500 font-medium">Configure Gemini AI for content automation.</p>
                  </div>
                </div>

                <FormRow label="Gemini API Key" hint="Keep this secret">
                  <input type="password" value={form.gemini_api_key || ""} onChange={(e) => update("gemini_api_key", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
                </FormRow>

                <FormRow label="AI Model" hint="Select preferred model">
                  <select value={form.gemini_model || "gemini-1.5-flash"} onChange={(e) => update("gemini_model", e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none appearance-none">
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Next-gen)</option>
                  </select>
                </FormRow>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Enable AI Optimization</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Allow AI to suggest improvements for job/bid listings.</p>
                  </div>
                  <Toggle checked={form.ai_enabled === "true"} onChange={(v) => update("ai_enabled", String(v))} />
                </div>
              </div>
            )}

            {activeSection === "maintenance" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    {sections.find(s => s.id === "maintenance")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Module Availability</h2>
                    <p className="text-sm text-slate-500 font-medium">Control which features are accessible to users.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100 group hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Jobs Module</h4>
                        <p className="text-xs text-slate-500 font-medium">Enable or disable the entire jobs section.</p>
                      </div>
                    </div>
                    <Toggle checked={form.jobs_enabled !== "false"} onChange={(v) => update("jobs_enabled", String(v))} />
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100 group hover:border-amber-500 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Bids Module</h4>
                        <p className="text-xs text-slate-500 font-medium">Enable or disable the entire bids section.</p>
                      </div>
                    </div>
                    <Toggle checked={form.bids_enabled !== "false"} onChange={(v) => update("bids_enabled", String(v))} />
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-amber-500 text-white shadow-xl shadow-amber-100">
                  <h4 className="font-black mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                    Maintenance Mode
                  </h4>
                  <p className="text-xs font-medium text-white/80 mb-6 leading-relaxed">Turn this on to show a "Coming Soon" screen to all public visitors.</p>
                  <div className="flex items-center gap-4">
                    <Toggle checked={form.maintenance_mode === "true"} onChange={(v) => update("maintenance_mode", String(v))} />
                    <span className="text-sm font-black uppercase tracking-widest">{form.maintenance_mode === "true" ? "ENABLED" : "DISABLED"}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "danger" && (
              <div className="space-y-10 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                    {sections.find(s => s.id === "danger")?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Danger Zone</h2>
                    <p className="text-sm text-slate-500 font-medium">Destructive actions. Proceed with caution.</p>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] border-2 border-red-100 space-y-8">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-red-50 pb-8">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Reset View Counters</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">Clear all job and bid view statistics.</p>
                      </div>
                      <button 
                        onClick={() => { if(confirm("Are you sure?")) resetViewsAction(); }}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-black hover:bg-red-600 hover:text-white transition-all"
                      >
                        Reset Counters
                      </button>
                   </div>

                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Purge Drafts</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">Delete all unpublished job/bid drafts older than 30 days.</p>
                      </div>
                      <button 
                        onClick={() => { if(confirm("Are you sure?")) deleteDraftsAction(); }}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-black hover:bg-red-600 hover:text-white transition-all"
                      >
                        Purge Drafts
                      </button>
                   </div>
                </div>

                <div className="p-8 rounded-[32px] bg-red-600 text-white shadow-2xl shadow-red-200">
                  <h4 className="font-black mb-1">Permanent Platform Deletion</h4>
                  <p className="text-xs font-medium text-white/70 mb-6 leading-relaxed">This will erase all data, users, and content. This cannot be undone.</p>
                  <input type="text" placeholder="Type DELETE to confirm" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-bold placeholder-white/40 focus:outline-none mb-4" />
                  <button disabled className="w-full py-4 bg-white text-red-600 rounded-2xl text-sm font-black shadow-xl opacity-50 cursor-not-allowed">Delete Everything</button>
                </div>
              </div>
            )}

            {/* Other sections can be added here with similar aesthetic */}

          </div>
        </div>
      </div>
    </div>
  );
}