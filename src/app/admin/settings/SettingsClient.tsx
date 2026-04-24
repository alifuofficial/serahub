"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { updateSettingsAction, resetViewsAction, deleteDraftsAction } from "@/actions/settings";
import ImageUpload from "@/components/common/ImageUpload";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  users: User[];
  config: Record<string, string>;
}

type Section = "general" | "seo" | "smtp" | "ads" | "appearance" | "storage" | "ai" | "users" | "danger";

const navItems = [
  { label: "Overview", href: "/admin", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Jobs", href: "/admin/jobs", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { label: "Bids", href: "/admin/bids", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { label: "Users", href: "/admin/users", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "Categories", href: "/admin/categories", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg> },
  { label: "Subscribers", href: "/admin/subscribers", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  { label: "Messages", href: "/admin/messages", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label: "Settings", href: "/admin/settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg> },
];

const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg> },
  { id: "seo", label: "SEO & Meta", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> },
  { id: "smtp", label: "SMTP / Email", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  { id: "ads", label: "AdSense", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
  { id: "appearance", label: "Appearance", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg> },
  { id: "storage", label: "Storage", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9"/><path d="M3 13h18"/><path d="M12 17V9"/><path d="m9 12 3 3 3-3"/></svg> },
  { id: "ai", label: "AI Configuration", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 3.8 2.8 2.8"/><path d="M22 12h-4"/><path d="m18.2 16.2-2.8 2.8"/><path d="M12 22v-4"/><path d="m7.8 20.2-2.8-2.8"/><path d="M2 12h4"/><path d="m5.8 7.8 2.8-2.8"/><circle cx="12" cy="12" r="4"/><path d="M16 12h.01"/><path d="M12 16h.01"/><path d="M8 12h.01"/><path d="M12 8h.01"/></svg> },
  { id: "users", label: "Users", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "danger", label: "Danger Zone", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-slate-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

export default function SettingsClient({ user, users, config }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDrafts, setConfirmDrafts] = useState(false);
  const [dangerMsg, setDangerMsg] = useState("");

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00c087] to-[#00e5a0] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/25">S</div>
              <span className="font-bold text-slate-800 text-lg hidden sm:inline">SeraHub</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{user.email}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg><span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 pb-4"><div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c087] to-[#00e5a0] flex items-center justify-center text-white font-bold text-sm">{(user.name || "A").charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{user.name || "Admin"}</p><p className="text-[11px] text-slate-400 truncate">{user.email}</p></div></div></div>
            <nav className="px-4 space-y-1 flex-1">{navItems.map((item) => (<Link key={item.label} href={item.href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${item.label === "Settings" ? "bg-gradient-to-r from-primary/10 to-[#00e5a0]/10 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{item.icon}{item.label}</Link>))}</nav>
            <div className="p-4 border-t border-slate-100"><Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Back to Site</Link></div>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 mt-1">Manage your site configuration and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-56 flex-shrink-0">
                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {sections.map((s) => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeSection === s.id ? "bg-gradient-to-r from-primary/10 to-[#00e5a0]/10 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>{s.icon}{s.label}</button>
                  ))}
                </nav>
              </div>

              <div className="flex-1 min-w-0">
                {saved && (
                  <div className="mb-6 p-4 rounded-xl bg-[#e6fbf4] border border-primary/20 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c087" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-sm font-semibold text-primary">Settings saved successfully!</span>
                  </div>
                )}

                {activeSection === "general" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#00e5a0] flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">Site Information</h2><p className="text-sm text-slate-500">Basic details about your platform.</p></div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">User Registration</p>
                            <p className="text-xs text-slate-500 mt-0.5">Allow new users to create accounts</p>
                          </div>
                          <Toggle checked={form.registration_enabled !== "false"} onChange={(v) => update("registration_enabled", v ? "true" : "false")} />
                        </div>
                        <FormRow label="Site Name" hint="Displayed in the browser tab and header"><input type="text" value={form.site_name} onChange={(e) => update("site_name", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="SeraHub" /></FormRow>
                        <FormRow label="Site Description" hint="A short description used in search results and social sharing"><textarea value={form.site_description} onChange={(e) => update("site_description", e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" placeholder="Discover the latest jobs, bids, and tender opportunities..." /></FormRow>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "seo" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">SEO & Meta Tags</h2><p className="text-sm text-slate-500">Control how your site appears in search results.</p></div>
                      </div>
                      <div className="space-y-5">
                        <FormRow label="Meta Keywords" hint="Comma-separated keywords for search engines"><input type="text" value={form.site_keywords} onChange={(e) => update("site_keywords", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="jobs, bids, tenders, Ethiopia, opportunities" /></FormRow>
                        <FormRow label="OG Title" hint="Title shown when sharing on social media"><input type="text" value={form.seo_og_title} onChange={(e) => update("seo_og_title", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="SeraHub | Job & Bid Aggregator" /></FormRow>
                        <FormRow label="OG Description" hint="Description shown when sharing on social media"><textarea value={form.seo_og_description} onChange={(e) => update("seo_og_description", e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" placeholder="Discover the latest jobs, bids, and tender opportunities." /></FormRow>
                        <FormRow label="OG Image URL" hint="Image shown when sharing on social media (1200x630 recommended)"><input type="url" value={form.seo_og_image} onChange={(e) => update("seo_og_image", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://serahub.com/og-image.png" /></FormRow>
                        <FormRow label="Google Site Verification" hint="Meta tag content for Google Search Console verification"><input type="text" value={form.seo_google_verification} onChange={(e) => update("seo_google_verification", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. abc123def456" /></FormRow>
                        <FormRow label="Google Analytics Tracking ID" hint="Your Google Analytics measurement ID (e.g. G-XXXXXXXXXX). Leave empty to disable analytics tracking."><input type="text" value={form.seo_google_analytics} onChange={(e) => update("seo_google_analytics", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="G-XXXXXXXXXX" /></FormRow>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "smtp" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">SMTP Configuration</h2><p className="text-sm text-slate-500">Configure email delivery for notifications and newsletters.</p></div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200/50">
                          <div>
                            <p className="text-sm font-semibold text-amber-900">SMTP is for future use</p>
                            <p className="text-xs text-amber-700 mt-0.5">Email sending will be available in a future update. Configure now to be ready.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormRow label="SMTP Host"><input type="text" value={form.smtp_host} onChange={(e) => update("smtp_host", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="smtp.example.com" /></FormRow>
                          <FormRow label="SMTP Port"><input type="text" value={form.smtp_port} onChange={(e) => update("smtp_port", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="587" /></FormRow>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormRow label="SMTP Username"><input type="text" value={form.smtp_user} onChange={(e) => update("smtp_user", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="noreply@serahub.com" /></FormRow>
                          <FormRow label="SMTP Password"><input type="password" value={form.smtp_pass} onChange={(e) => update("smtp_pass", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••" /></FormRow>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormRow label="From Email"><input type="email" value={form.smtp_from} onChange={(e) => update("smtp_from", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="noreply@serahub.com" /></FormRow>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secure Connection</label>
                            <div className="flex items-center gap-3 mt-2">
                              <Toggle checked={form.smtp_secure === "true"} onChange={(v) => update("smtp_secure", v ? "true" : "false")} />
                              <span className="text-sm text-slate-600">{form.smtp_secure === "true" ? "TLS enabled" : "No encryption"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "ads" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">AdSense Configuration</h2><p className="text-sm text-slate-500">Configure Google AdSense for monetization.</p></div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                          <div><p className="text-sm font-semibold text-slate-800">Enable AdSense</p><p className="text-xs text-slate-500 mt-0.5">Show ad placeholders on the site</p></div>
                          <Toggle checked={form.ads_enabled === "true"} onChange={(v) => update("ads_enabled", v ? "true" : "false")} />
                        </div>
                        <FormRow label="AdSense Client ID" hint="Your Google AdSense publisher ID"><input type="text" value={form.ads_client_id} onChange={(e) => update("ads_client_id", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="ca-pub-XXXXXXXXXXXXXXXX" /></FormRow>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "appearance" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">Branding & Appearance</h2><p className="text-sm text-slate-500">Customize logos, favicon, and colors.</p></div>
                      </div>
                      <div className="space-y-5">
                        <ImageUpload label="Site Logo" hint="Logo displayed in the navbar and footer (recommended: SVG or PNG, ~200x40px)" value={form.appearance_logo_url || ""} onChange={(url) => update("appearance_logo_url", url)} accept="image/svg+xml,image/png,image/webp" />
                        <ImageUpload label="Dark/Alternative Logo" hint="Logo for dark backgrounds (optional)" value={form.appearance_dark_logo_url || ""} onChange={(url) => update("appearance_dark_logo_url", url)} accept="image/svg+xml,image/png,image/webp" />
                        <ImageUpload label="Favicon" hint="Icon shown in browser tabs (recommended: ICO or PNG, 32x32 or 64x64)" value={form.appearance_favicon_url || ""} onChange={(url) => update("appearance_favicon_url", url)} accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml" />
                        <FormRow label="Primary Brand Color" hint="Used for buttons, links, and accents across the site">
                          <div className="flex items-center gap-3">
                            <input type="color" value={form.appearance_primary_color || "#00c087"} onChange={(e) => update("appearance_primary_color", e.target.value)} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                            <input type="text" value={form.appearance_primary_color} onChange={(e) => update("appearance_primary_color", e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="#00c087" />
                          </div>
                        </FormRow>
                        <FormRow label="Site URL" hint="The canonical URL of your website">
                          <input type="url" value={form.appearance_site_url} onChange={(e) => update("appearance_site_url", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://serahub.com" />
                        </FormRow>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "storage" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9"/><path d="M3 13h18"/><path d="M12 17V9"/><path d="m9 12 3 3 3-3"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">FTP Storage Configuration</h2><p className="text-sm text-slate-500">Enable remote file storage for all your uploads.</p></div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                          <div><p className="text-sm font-semibold text-slate-800">Enable FTP Storage</p><p className="text-xs text-slate-500 mt-0.5">When enabled, all new uploads will be stored on the FTP server</p></div>
                          <Toggle checked={form.ftp_enabled === "true"} onChange={(v) => update("ftp_enabled", v ? "true" : "false")} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                          <div className="sm:col-span-3">
                            <FormRow label="FTP Host"><input type="text" value={form.ftp_host} onChange={(e) => update("ftp_host", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="ftp.example.com" /></FormRow>
                          </div>
                          <FormRow label="FTP Port"><input type="text" value={form.ftp_port} onChange={(e) => update("ftp_port", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="21" /></FormRow>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormRow label="FTP Username"><input type="text" value={form.ftp_user} onChange={(e) => update("ftp_user", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="user@example.com" /></FormRow>
                          <FormRow label="FTP Password"><input type="password" value={form.ftp_pass} onChange={(e) => update("ftp_pass", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••" /></FormRow>
                        </div>
                        <FormRow label="Root Directory" hint="The path on the FTP server where files will be saved (e.g., /public_html/uploads)"><input type="text" value={form.ftp_root} onChange={(e) => update("ftp_root", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="/" /></FormRow>
                        <FormRow label="Public URL" hint="The public URL where these files are accessible (e.g., https://cdn.example.com/uploads)"><input type="url" value={form.ftp_public_url} onChange={(e) => update("ftp_public_url", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://cdn.example.com" /></FormRow>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "ai" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 3.8 2.8 2.8"/><path d="M22 12h-4"/><path d="m18.2 16.2-2.8 2.8"/><path d="M12 22v-4"/><path d="m7.8 20.2-2.8-2.8"/><path d="M2 12h4"/><path d="m5.8 7.8 2.8-2.8"/><circle cx="12" cy="12" r="4"/><path d="M16 12h.01"/><path d="M12 16h.01"/><path d="M8 12h.01"/><path d="M12 8h.01"/></svg></div>
                        <div><h2 className="text-lg font-bold text-slate-900">AI Provider Configuration</h2><p className="text-sm text-slate-500">Enable AI features for SEO optimization and categorization.</p></div>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                          <div><p className="text-sm font-semibold text-slate-800">Enable AI Features</p><p className="text-xs text-slate-500 mt-0.5">Use AI to automatically fix SEO, detect errors, and categorize content</p></div>
                          <Toggle checked={form.ai_enabled === "true"} onChange={(v) => update("ai_enabled", v ? "true" : "false")} />
                        </div>
                        
                        <FormRow label="Preferred AI Provider" hint="Select the AI model you want to use for background tasks">
                          <select 
                            value={form.ai_provider || "gemini"} 
                            onChange={(e) => update("ai_provider", e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            <option value="gemini">Google Gemini (Recommended)</option>
                            <option value="qwen">Qwen AI (Alibaba)</option>
                          </select>
                        </FormRow>

                        <div className="grid grid-cols-1 gap-5">
                          <FormRow label="Gemini API Key" hint="Required if Gemini is selected. Get it from Google AI Studio.">
                            <input type="password" value={form.gemini_api_key} onChange={(e) => update("gemini_api_key", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••" />
                          </FormRow>
                          <FormRow label="Qwen API Key" hint="Required if Qwen is selected. Get it from Alibaba Cloud DashScope.">
                            <input type="password" value={form.qwen_api_key} onChange={(e) => update("qwen_api_key", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••" />
                          </FormRow>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/50">
                          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                            AI Capabilities
                          </h4>
                          <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside ml-1">
                            <li><strong>SEO Optimization:</strong> Automatically generates meta descriptions and optimized titles.</li>
                            <li><strong>Error Detection:</strong> Flags inconsistent deadlines or missing contact info in descriptions.</li>
                            <li><strong>Smart Categorization:</strong> Suggests the best category based on the job or bid content.</li>
                            <li><strong>Grammar Fix:</strong> Ensures job postings look professional and clean.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={isPending} className="btn-primary text-sm disabled:opacity-50">{isPending ? "Saving..." : "Save Changes"}</button></div>
                  </div>
                )}

                {activeSection === "users" && (
                  <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                      <h2 className="text-lg font-bold text-slate-900">All Users</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-slate-100"><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === "ADMIN" ? "bg-gradient-to-br from-[#00c087] to-[#00e5a0]" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>{(u.name || "U").charAt(0).toUpperCase()}</div><div><p className="text-sm font-semibold text-slate-800">{u.name || "Unnamed"}</p><p className="text-xs text-slate-400">{u.email}</p></div></div></td>
                              <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${u.role === "ADMIN" ? "bg-[#e6fbf4] text-primary" : "bg-blue-50 text-blue-600"}`}>{u.role}</span></td>
                              <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === "danger" && (
                  <div className="bg-white rounded-2xl border border-red-200/60 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg></div>
                      <div><h2 className="text-lg font-bold text-red-600">Danger Zone</h2><p className="text-sm text-slate-500">Irreversible actions. Proceed with caution.</p></div>
                    </div>
                    {dangerMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-[#e6fbf4] border border-primary/20 text-sm font-semibold text-primary">{dangerMsg}</div>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                        <div><p className="text-sm font-semibold text-slate-800">Clear All Views Count</p><p className="text-xs text-slate-500 mt-0.5">Reset all job and bid view counters to zero</p></div>
                        {confirmReset ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => startTransition(async () => { await resetViewsAction(); setConfirmReset(false); setDangerMsg("All views have been reset to zero."); setTimeout(() => setDangerMsg(""), 3000); })} disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">{isPending ? "Resetting..." : "Confirm"}</button>
                            <button onClick={() => setConfirmReset(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmReset(true)} className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">Reset Views</button>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                        <div><p className="text-sm font-semibold text-slate-800">Delete All Draft Content</p><p className="text-xs text-slate-500 mt-0.5">Remove all jobs and bids with DRAFT status</p></div>
                        {confirmDrafts ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => startTransition(async () => { const res = await deleteDraftsAction(); setConfirmDrafts(false); setDangerMsg(`Deleted ${(res as { deletedJobs: number; deletedBids: number }).deletedJobs} draft jobs and ${(res as { deletedJobs: number; deletedBids: number }).deletedBids} draft bids.`); setTimeout(() => setDangerMsg(""), 5000); })} disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">{isPending ? "Deleting..." : "Confirm"}</button>
                            <button onClick={() => setConfirmDrafts(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDrafts(true)} className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">Delete Drafts</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}