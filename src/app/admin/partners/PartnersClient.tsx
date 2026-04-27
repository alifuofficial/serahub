"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPartner, updatePartner, deletePartner } from "@/actions/partners";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  active: boolean;
  order: number;
  createdAt: Date | string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  partners: Partner[];
}

export default function PartnersClient({ partners }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setLogoPreview(data.url);
      }
    } catch (err) {
      setError("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    startTransition(async () => {
      await deletePartner(id);
      router.refresh();
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = editingPartner 
        ? await updatePartner(editingPartner.id, formData)
        : await createPartner(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        setEditingPartner(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Partner <span className="text-primary">Ecosystem</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{partners.length} organizations showcased on the platform.</p>
        </div>
        <button 
          onClick={() => { setEditingPartner(null); setLogoPreview(null); setShowForm(true); }} 
          className="px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-[32px] border border-slate-200/50 p-8 group hover:border-primary hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center p-4 mb-6 group-hover:scale-110 transition-transform duration-500">
              <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <h3 className="font-black text-slate-900 mb-1 tracking-tight">{partner.name}</h3>
            {partner.website && (
              <a href={partner.website} target="_blank" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors mb-6">
                Visit Website
              </a>
            )}
            <div className="mt-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => { setEditingPartner(partner); setLogoPreview(partner.logoUrl); setShowForm(true); }} 
                className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button 
                onClick={() => handleDelete(partner.id)} 
                className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>
        ))}
        {partners.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
            </div>
            <p className="text-slate-400 font-bold">No partners showcased yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{editingPartner ? "Refine Partner" : "New Ecosystem Partner"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                <input name="name" defaultValue={editingPartner?.name ?? ""} required placeholder="e.g. Google Cloud" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Identity</label>
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 relative shadow-sm">
                    { (logoPreview || editingPartner?.logoUrl) ? (
                      <img src={logoPreview || editingPartner?.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden" 
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                       {logoPreview ? "Change Logo" : "Upload Logo"}
                    </label>
                    <input type="hidden" name="logoUrl" value={logoPreview || editingPartner?.logoUrl || ""} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website</label>
                  <input name="website" defaultValue={editingPartner?.website ?? ""} placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                  <input name="order" type="number" defaultValue={editingPartner?.order ?? 0} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => { setShowForm(false); setLogoPreview(null); }} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Dismiss</button>
                <button 
                  type="submit" 
                  disabled={isPending || isUploading || (!logoPreview && !editingPartner?.logoUrl)} 
                  className="px-10 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPending ? "Persisting..." : "Save Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
