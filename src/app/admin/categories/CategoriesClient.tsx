"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCategoryAction, deleteCategoryAction } from "@/actions/categories";
import { logoutAction } from "@/actions/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: { jobs: number; bids: number };
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  categories: CategoryItem[];
}


export default function CategoriesClient({ user, categories }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setError(null);
    setIsCreating(true);

    try {
      const fd = new FormData();
      fd.set("name", trimmed);
      const result = await createCategoryAction(fd);
      
      if (result?.error) {
        setError(result.error);
        setIsCreating(false);
      } else {
        setNewName("");
        startTransition(() => {
          router.refresh();
          setIsCreating(false);
        });
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure? This will remove the category from all jobs and bids.")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteCategoryAction(fd);
      router.refresh();
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
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Categories" />

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
              <p className="text-slate-500 mt-1">{categories.length} categories</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Add Category</h2>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name (e.g. Healthcare, Engineering)" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                <button type="submit" disabled={isCreating || !newName.trim()} className="btn-primary text-sm disabled:opacity-50 min-w-[130px]">
                  {isCreating ? (
                    <span className="flex items-center gap-2"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Adding...</span>
                  ) : "Add Category"}
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Jobs</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Bids</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No categories yet. Add one above!</td></tr>
                    ) : categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                        <td className="px-6 py-4 text-center"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#e6fbf4] text-primary">{cat._count.jobs}</span></td>
                        <td className="px-6 py-4 text-center"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600">{cat._count.bids}</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 0-2 1-2h6c1 0 1 1 1 2v2"/></svg>
                          </button>
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