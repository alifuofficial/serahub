"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createJobAction, updateJobAction, deleteJobAction, saveJobDraftAction } from "@/actions/admin";
import { logoutAction } from "@/actions/auth";
import { useAutoSave } from "@/hooks/useAutoSave";

const Editor = dynamic(() => import("@/components/editor/Editor"), { ssr: false });

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  source: string | null;
  applyLink: string | null;
  deadline: string | null;
  status: string;
  views: number;
  categoryId: string | null;
  category: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  jobs: Job[];
  categories: Category[];
  filters: { q: string; status: string; category: string };
}

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

export default function JobsClient({ user, jobs, categories, filters }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [descriptionData, setDescriptionData] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [aiResult, setAiResult] = useState<null | {
    categoryName?: string;
    keywords?: string[];
    metaDescription?: string;
    suggestedTitle?: string;
    grammarNotes?: string;
    warnings?: string[];
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const getFormData = useCallback(() => {
    const fd = new FormData();
    if (editingJob) fd.set("id", editingJob.id);
    const formEl = document.querySelector<HTMLFormElement>('form[action]');
    if (formEl) {
      const inputs = formEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[name], select[name], textarea[name]');
      inputs.forEach((el) => { fd.set(el.name, el.value); });
    }
    fd.set("description", descriptionData);
    fd.set("status", editingJob?.status ?? "DRAFT");
    return fd;
  }, [editingJob, descriptionData]);

  const { lastSaved, isSaving: isAutoSaving, draftId, save: saveDraft } = useAutoSave({
    onSave: saveJobDraftAction,
    getFormData,
    enabled: showForm,
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteJobAction(fd);
      router.refresh();
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setAiResult(null);
    setIsSubmitting(true);
    const action = editingJob ? updateJobAction : createJobAction;
    if (editingJob) formData.set("id", editingJob.id);
    formData.set("description", descriptionData);
    const result = await action(formData);
    setIsSubmitting(false);
    if (result?.error) {
      setError(result.error);
    } else {
      const res = result as any;
      if (!editingJob && res?.ai) {
        setAiResult(res.ai);
      }
      setShowForm(false);
      setEditingJob(null);
      setDescriptionData("");
      router.refresh();
    }
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
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="SeraHub" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-slate-800 text-lg hidden sm:inline">SeraHub</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {user.email}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c087] to-[#00e5a0] flex items-center justify-center text-white font-bold text-sm">{(user.name || "A").charAt(0).toUpperCase()}</div>
                <div className="min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{user.name || "Admin"}</p><p className="text-[11px] text-slate-400 truncate">{user.email}</p></div>
              </div>
            </div>
            <nav className="px-4 space-y-1 flex-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${item.label === "Jobs" ? "bg-gradient-to-r from-primary/10 to-[#00e5a0]/10 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                  {item.icon}{item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Back to Site
              </Link>
            </div>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Jobs</h1>
                <p className="text-slate-500 mt-1">{jobs.length} total jobs</p>
              </div>
              <button onClick={() => { setEditingJob(null); setDescriptionData(""); setFormKey((k) => k + 1); setShowForm(true); }} className="btn-primary text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                Add Job
              </button>
            </div>

            <form method="GET" action="/admin/jobs" className="flex flex-col sm:flex-row gap-3 mb-6">
              <input name="q" defaultValue={filters.q} placeholder="Search jobs..." className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              <select name="status" defaultValue={filters.status} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
              <select name="category" defaultValue={filters.category} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="btn-primary text-sm px-5">Filter</button>
            </form>

            {showForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditingJob(null); setDescriptionData(""); setAiResult(null); }}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{editingJob ? "Edit Job" : "Create Job"}</h2>
                      {isAutoSaving && <p className="text-xs text-slate-400 mt-0.5">Saving draft...</p>}
                      {!isAutoSaving && lastSaved && <p className="text-xs text-emerald-500 mt-0.5">Draft saved {lastSaved.toLocaleTimeString()}</p>}
                    </div>
                    <button onClick={() => { setShowForm(false); setEditingJob(null); setDescriptionData(""); setAiResult(null); }} className="p-1 text-slate-400 hover:text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                  </div>
                  <form action={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
                      <input name="title" defaultValue={editingJob?.title ?? ""} key={editingJob?.id ?? "new"} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                      <Editor
                        key={editingJob?.id ?? "new"}
                        initialData={descriptionData}
                        onChange={(data) => setDescriptionData(data)}
                        placeholder="Write the job description..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company / Hiring Organization</label>
                        <input name="company" defaultValue={(editingJob as any)?.company ?? ""} key={`company-${editingJob?.id ?? "new"}`} placeholder="e.g. Google, Safaricom" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Source</label>
                        <input name="source" defaultValue={editingJob?.source ?? ""} key={`source-${editingJob?.id ?? "new"}`} placeholder="e.g. Remote, Global" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apply Link</label>
                        <input name="applyLink" defaultValue={editingJob?.applyLink ?? ""} key={`apply-${editingJob?.id ?? "new"}`} placeholder="https://..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deadline</label>
                        <input name="deadline" type="date" defaultValue={editingJob?.deadline?.split("T")[0] ?? ""} key={`deadline-${editingJob?.id ?? "new"}`} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-[10px] font-normal text-primary">AI will auto-assign</span></label>
                        <select name="categoryId" defaultValue={editingJob?.categoryId ?? ""} key={`cat-${editingJob?.id ?? "new"}`} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                          <option value="">None (AI will suggest)</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                      <select name="status" defaultValue={editingJob?.status ?? "PUBLISHED"} key={`status-${editingJob?.id ?? "new"}`} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    {isSubmitting && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-200">
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        <span className="text-xs font-semibold text-violet-700">✨ AI is analyzing your post for SEO, categorization, and grammar...</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowForm(false); setEditingJob(null); setDescriptionData(""); setAiResult(null); }} className="btn-secondary text-sm">Cancel</button>
                      <button type="button" onClick={() => saveDraft()} disabled={isAutoSaving} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">{isAutoSaving ? "Saving..." : "Save Draft"}</button>
                      <button type="submit" disabled={isPending || isSubmitting} className="btn-primary text-sm disabled:opacity-50">{isSubmitting ? "Processing..." : isPending ? "Publishing..." : editingJob ? "Update Job" : "Publish Job"}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {aiResult && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAiResult(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">AI Enhancements Applied</h2>
                    </div>
                    <button onClick={() => setAiResult(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {aiResult.categoryName && (
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto-Categorized</p><p className="text-sm font-bold text-slate-800">{aiResult.categoryName}</p></div>
                      </div>
                    )}
                    {aiResult.metaDescription && (
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SEO Meta Description</p><p className="text-sm text-slate-700">{aiResult.metaDescription}</p></div>
                      </div>
                    )}
                    {aiResult.keywords && aiResult.keywords.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-600"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SEO Keywords</p><div className="flex flex-wrap gap-1.5 mt-1">{aiResult.keywords.map(k => <span key={k} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium">{k}</span>)}</div></div>
                      </div>
                    )}
                    {aiResult.grammarNotes && (
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></span>
                        <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grammar Note</p><p className="text-sm text-slate-700">{aiResult.grammarNotes}</p></div>
                      </div>
                    )}
                    {aiResult.warnings && aiResult.warnings.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Warnings</p>
                        {aiResult.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5"><span className="mt-0.5">⚠️</span>{w}</p>)}
                      </div>
                    )}
                    <button onClick={() => setAiResult(null)} className="w-full btn-primary text-sm mt-2">Got it!</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Views</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No jobs found. Create your first job!</td></tr>
                    ) : jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00c087]/10 to-[#00e5a0]/10 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{job.title}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[200px]">{job.source || "No source"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell"><span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{job.category?.name || "Uncategorized"}</span></td>
                        <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${job.status === "PUBLISHED" ? "bg-[#e6fbf4] text-primary" : "bg-slate-100 text-slate-500"}`}>{job.status === "PUBLISHED" ? "Live" : job.status}</span></td>
                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{job.views}</td>
                        <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-400">{new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingJob(job); setDescriptionData(job.description); setFormKey((k) => k + 1); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button onClick={() => handleDelete(job.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 0-2 1-2h6c1 0 1 1 1 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}