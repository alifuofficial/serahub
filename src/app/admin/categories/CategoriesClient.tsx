"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, deleteCategoryAction } from "@/actions/categories";

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

export default function CategoriesClient({ categories }: Props) {
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
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            System <span className="text-primary">Categories</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{categories.length} taxonomy units available for classification.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-2xl p-8 lg:p-10">
        <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Create Taxonomy</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="Category name (e.g. Healthcare, Engineering)" 
            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary transition-all" 
          />
          <button 
            type="submit" 
            disabled={isCreating || !newName.trim()} 
            className="px-8 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "Add Category"}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs font-bold mt-3 uppercase tracking-widest">{error}</p>}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Detail</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jobs</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bids</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                    </div>
                    <p className="text-slate-400 font-bold">No categories added yet</p>
                  </td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">{cat.slug}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-800">{cat._count.jobs}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-800">{cat._count.bids}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Taxonomy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}