"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { createUserAction, updateUserAction, deleteUserAction } from "@/actions/admin-users";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; role: string };
  users: UserItem[];
}

export default function UsersClient({ user, users }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "PRO_JOB": return "bg-purple-50 text-purple-600 border-purple-100";
      case "PRO_BID": return "bg-amber-50 text-amber-600 border-amber-100";
      case "TRIAL": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "FREE": default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = editingUser 
        ? await updateUserAction(formData)
        : await createUserAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        setEditingUser(null);
        router.refresh();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    const formData = new FormData();
    formData.append("id", id);

    startTransition(async () => {
      const result = await deleteUserAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
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
        <AdminSidebar mobileOpen={mobileOpen} user={user} activeLabel="Users" />

        {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                <p className="text-slate-500 mt-1">{users.length} registered users across all roles</p>
              </div>
              <button 
                onClick={() => { setEditingUser(null); setError(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
                Add New User
              </button>
            </div>

            <div className="mb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-200/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Plan</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
                            </div>
                            <p className="text-slate-400 text-sm">No users found matching your search.</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${u.role === "ADMIN" ? "bg-gradient-to-br from-[#00c087] to-[#00e5a0]" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                              {(u.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{u.name || "Unnamed User"}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.role === "ADMIN" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                              {u.role}
                            </span>
                            <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getPlanBadge(u.subscriptionPlan)}`}>
                              {u.subscriptionPlan.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingUser(u); setError(null); setShowModal(true); }}
                              className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                              title="Edit User"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete User"
                              disabled={u.id === user.id}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 0-2 1-2h6c1 0 1 1 1 2v2"/></svg>
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

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-900">{editingUser ? "Edit User Account" : "Create New User"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-semibold animate-in slide-in-from-top-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {error}
                </div>
              )}

              {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <input 
                    name="name" 
                    defaultValue={editingUser?.name || ""} 
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Account Role</label>
                  <select 
                    name="role" 
                    defaultValue={editingUser?.role || "USER"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="USER">Standard User</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Subscription Plan</label>
                  <select 
                    name="subscriptionPlan" 
                    defaultValue={editingUser?.subscriptionPlan || "FREE"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="FREE">Free Plan</option>
                    <option value="PRO_JOB">Pro Jobs</option>
                    <option value="PRO_BID">Pro Bids</option>
                    <option value="TRIAL">Free Trial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingUser?.email || ""} 
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  {editingUser ? "Change Password (Leave blank to keep current)" : "Password"}
                </label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder={editingUser ? "••••••••" : "At least 6 characters"}
                  required={!editingUser}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-[2] px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending && <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  {editingUser ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}