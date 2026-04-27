"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createJobAction, updateJobAction, deleteJobAction, saveJobDraftAction, reviewJobAction } from "@/actions/admin";
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
  company: string | null;
  locationType: string | null;
  careerLevel: string | null;
  employmentType: string | null;
  vacancyCount: string | null;
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

export default function JobsClient({ user, jobs, categories, filters }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [descriptionData, setDescriptionData] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [draftIdState, setDraftIdState] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<null | {
    categoryName?: string;
    keywords?: string[];
    metaDescription?: string;
    suggestedTitle?: string;
    grammarNotes?: string;
    warnings?: string[];
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<null | {
    fixedTitle: string;
    fixedDescriptionText: string;
    categoryName?: string;
    keywords?: string[];
    metaDescription?: string;
    grammarNotes?: string;
    warnings?: string[];
    company?: string;
    locationType?: string;
    careerLevel?: string;
    employmentType?: string;
    vacancyCount?: string;
    deadline?: string;
  }>(null);
  const [hasAppliedReview, setHasAppliedReview] = useState(false);
  const router = useRouter();

  const getFormData = useCallback(() => {
    const fd = new FormData();
    const id = editingJob?.id || draftIdState;
    if (id) fd.set("id", id);
    const formEl = document.querySelector<HTMLFormElement>('#job-form');
    if (formEl) {
      const inputs = formEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[name], select[name], textarea[name]');
      inputs.forEach((el) => { fd.set(el.name, el.value); });
    }
    fd.set("description", descriptionData);
    return fd;
  }, [editingJob, draftIdState, descriptionData]);

  const { isSaving, lastSaved } = useAutoSave({
    onSave: async (fd) => {
      const title = fd.get("title") as string;
      if (!title || title.trim().length < 3) return null;
      return await saveJobDraftAction(fd);
    },
    getFormData,
    onSaveSuccess: (id) => {
      if (!editingJob) setDraftIdState(id);
    },
    enabled: showForm && !editingJob,
    interval: 10000
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("description", descriptionData);
    const id = editingJob?.id || draftIdState;
    if (id) fd.set("id", id);

    const result = editingJob || draftIdState ? await updateJobAction(fd) : await createJobAction(fd);
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
      setReviewResult(null);
      router.refresh();
    }
  };

  const handleReview = async () => {
    setError(null);
    setReviewResult(null);
    setIsReviewing(true);
    const fd = new FormData();
    const formEl = document.querySelector<HTMLFormElement>('#job-form');
    if (formEl) {
      const inputs = formEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[name], select[name], textarea[name]');
      inputs.forEach((el) => { fd.set(el.name, el.value); });
    }
    fd.set("description", descriptionData);
    const result = await reviewJobAction(fd);
    setIsReviewing(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.review) {
      setReviewResult(result.review);
    }
  };

  const applyAiReview = () => {
    if (!reviewResult) return;
    const formEl = document.querySelector<HTMLFormElement>('#job-form');
    if (!formEl) return;

    if (reviewResult.fixedTitle) {
      const titleInput = formEl.querySelector<HTMLInputElement>('input[name="title"]');
      if (titleInput) titleInput.value = reviewResult.fixedTitle;
    }

    if (reviewResult.company) {
      const companyInput = formEl.querySelector<HTMLInputElement>('input[name="company"]');
      if (companyInput) companyInput.value = reviewResult.company;
    }

    if (reviewResult.locationType) {
      const locationInput = formEl.querySelector<HTMLSelectElement>('select[name="locationType"]');
      if (locationInput) locationInput.value = reviewResult.locationType;
    }

    if (reviewResult.employmentType) {
      const employmentInput = formEl.querySelector<HTMLSelectElement>('select[name="employmentType"]');
      if (employmentInput) employmentInput.value = reviewResult.employmentType;
    }

    if (reviewResult.careerLevel) {
      const careerInput = formEl.querySelector<HTMLInputElement>('input[name="careerLevel"]');
      if (careerInput) careerInput.value = reviewResult.careerLevel;
    }

    if (reviewResult.vacancyCount) {
      const vacancyInput = formEl.querySelector<HTMLInputElement>('input[name="vacancyCount"]');
      if (vacancyInput) vacancyInput.value = reviewResult.vacancyCount;
    }

    if (reviewResult.deadline) {
      const deadlineInput = formEl.querySelector<HTMLInputElement>('input[name="deadline"]');
      if (deadlineInput) deadlineInput.value = reviewResult.deadline;
    }

    if (reviewResult.categoryName) {
      const cat = categories.find(c => c.name.toLowerCase() === reviewResult.categoryName?.toLowerCase());
      if (cat) {
        const catSelect = formEl.querySelector<HTMLSelectElement>('select[name="categoryId"]');
        if (catSelect) catSelect.value = cat.id;
      }
    }

    setReviewResult(null);
    setHasAppliedReview(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const fd = new FormData();
    fd.set("id", id);
    await deleteJobAction(fd);
    router.refresh();
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manage <span className="text-primary">Jobs</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Create, edit, and optimize your job listings.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { 
              setEditingJob(null); 
              setDraftIdState(null);
              setAiResult(null);
              setReviewResult(null);
              setHasAppliedReview(false);
              setDescriptionData(""); 
              setShowForm(true); 
              setFormKey(prev => prev + 1);
            }} 
            className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Create New Job
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingJob ? "Edit Job" : "Post a New Job"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {isSaving ? (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Saving...
                    </span>
                  ) : lastSaved ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Draft saved {lastSaved.toLocaleTimeString()}</span>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium">Fill in the details below.</p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-8 lg:p-12">
            <form id="job-form" key={formKey} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Job Title</label>
                  <input type="text" name="title" defaultValue={editingJob?.title} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" placeholder="e.g. Senior Software Engineer" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-900">Job Description</label>
                    <button 
                      type="button" 
                      onClick={handleReview} 
                      disabled={isReviewing || descriptionData.length < 50}
                      className="text-xs font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      {isReviewing ? "Analyzing..." : "Optimize with AI"}
                    </button>
                  </div>
                  <div className="border border-slate-100 rounded-[24px] overflow-hidden">
                    <Editor initialData={editingJob?.description || ""} onChange={setDescriptionData} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Company Name</label>
                    <input type="text" name="company" defaultValue={editingJob?.company || ""} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-900 font-bold focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Location Type</label>
                    <select name="locationType" defaultValue={editingJob?.locationType || ""} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-900 font-bold focus:outline-none focus:border-primary transition-all appearance-none">
                      <option value="">Select...</option>
                      <option value="REMOTE">Remote</option>
                      <option value="ON_SITE">On-site</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-4">Job Details</h3>
                  
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select name="categoryId" defaultValue={editingJob?.categoryId || ""} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary appearance-none">
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Employment</label>
                    <select name="employmentType" defaultValue={editingJob?.employmentType || ""} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary appearance-none">
                      <option value="">Select...</option>
                      <option value="FULL_TIME">Full-time</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Career Level</label>
                    <input type="text" name="careerLevel" defaultValue={editingJob?.careerLevel || ""} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none" placeholder="e.g. Mid-Level" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Source URL</label>
                    <input type="text" name="source" defaultValue={editingJob?.source || ""} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none" placeholder="Original URL" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <select name="status" defaultValue={editingJob?.status || "PUBLISHED"} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary appearance-none">
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                {reviewResult && (
                  <div className="p-8 rounded-[32px] bg-violet-600 text-white shadow-xl shadow-violet-200 animate-in slide-in-from-right-4 duration-500">
                    <h4 className="font-black text-lg tracking-tight mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      AI Optimization
                    </h4>
                    <p className="text-xs font-medium text-white/80 mb-6 leading-relaxed">AI has suggested improvements for better search visibility and clarity.</p>
                    <button 
                      type="button" 
                      onClick={applyAiReview} 
                      className="w-full py-4 bg-white text-violet-600 rounded-2xl text-sm font-black shadow-lg shadow-violet-900/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Apply All Improvements
                    </button>
                    {reviewResult.grammarNotes && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Quality Note</p>
                        <p className="text-xs italic text-white/90 leading-relaxed">&ldquo;{reviewResult.grammarNotes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-3 pt-10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {editingJob && (
                    <button type="button" onClick={() => handleDelete(editingJob.id)} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                      Delete permanently
                    </button>
                  )}
                  <button type="button" onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl transition-all">Cancel</button>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? "Processing..." : (editingJob ? "Save Changes" : "Publish Job")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
             <div className="relative flex-1 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all"
                  value={filters.q}
                  onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    if (e.target.value) params.set('q', e.target.value); else params.delete('q');
                    router.push(`/admin/jobs?${params.toString()}`);
                  }}
                />
             </div>
             <div className="flex items-center gap-3">
               <select 
                 className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                 value={filters.status}
                 onChange={(e) => {
                   const params = new URLSearchParams(window.location.search);
                   if (e.target.value) params.set('status', e.target.value); else params.delete('status');
                   router.push(`/admin/jobs?${params.toString()}`);
                 }}
               >
                 <option value="">All Status</option>
                 <option value="PUBLISHED">Published</option>
                 <option value="DRAFT">Draft</option>
                 <option value="CLOSED">Closed</option>
               </select>
               <select 
                 className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                 value={filters.category}
                 onChange={(e) => {
                   const params = new URLSearchParams(window.location.search);
                   if (e.target.value) params.set('category', e.target.value); else params.delete('category');
                   router.push(`/admin/jobs?${params.toString()}`);
                 }}
               >
                 <option value="">All Categories</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Information</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{job.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400">{job.category?.name || 'Uncategorized'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-bold text-slate-400">{job.company || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        job.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 
                        job.status === 'DRAFT' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{job.views.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Views</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { 
                            setEditingJob(job); 
                            setDescriptionData(job.description); 
                            setShowForm(true); 
                            setAiResult(null);
                            setReviewResult(null);
                            setHasAppliedReview(false);
                            setFormKey(prev => prev + 1);
                          }} 
                          className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      </div>
                      <p className="text-slate-400 font-bold">No jobs found matching your criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}