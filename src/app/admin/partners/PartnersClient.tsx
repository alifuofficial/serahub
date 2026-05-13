"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPartner, updatePartner, deletePartner } from "@/actions/partners";
import { logoutAction } from "@/actions/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

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


export default function PartnersClient({ user, partners }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
        // We'll use this URL in the hidden input or state
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
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Partners" />

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Partner Logos</h1>
                <p className="text-slate-500 mt-1">{partners.length} total partners</p>
              </div>
              <button onClick={() => { setEditingPartner(null); setLogoPreview(null); setShowForm(true); }} className="btn-primary text-sm">
                Add Partner
              </button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">{editingPartner ? "Edit Partner" : "Add Partner"}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
                      <input name="name" defaultValue={editingPartner?.name ?? ""} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Partner Logo *</label>
                      <div className="flex flex-col gap-3">
                        { (logoPreview || editingPartner?.logoUrl) && (
                          <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 relative group/preview">
                            <img src={logoPreview || editingPartner?.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            {isUploading && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                        />
                        <input type="hidden" name="logoUrl" value={logoPreview || editingPartner?.logoUrl || ""} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website URL</label>
                      <input name="website" defaultValue={editingPartner?.website ?? ""} placeholder="https://..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Order</label>
                      <input name="order" type="number" defaultValue={editingPartner?.order ?? 0} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => { setShowForm(false); setLogoPreview(null); }} className="btn-secondary text-sm">Cancel</button>
                      <button type="submit" disabled={isPending || isUploading || (!logoPreview && !editingPartner?.logoUrl)} className="btn-primary text-sm disabled:opacity-50">
                        {isPending ? "Saving..." : "Save Partner"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-2xl border border-slate-200/60 p-6 group hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2">
                      <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingPartner(partner); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button onClick={() => handleDelete(partner.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 0-2 1-2h6c1 0 1 1 1 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800">{partner.name}</h3>
                  {partner.website && <p className="text-xs text-slate-400 truncate">{partner.website}</p>}
                </div>
              ))}
              {partners.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-400">No partners added yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
