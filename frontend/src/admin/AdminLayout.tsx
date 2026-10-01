import React from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Activity, BrainCircuit, Database, FileText, LayoutDashboard, LockKeyhole, LogOut, ScanLine, Settings, ShieldCheck, Users, UserRoundCheck, ClipboardList, BarChart3, Cpu, Stethoscope, MapPinned } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard], ["Admin Requests", "/admin/access-requests", ShieldCheck], ["Users", "/admin/users", Users], ["Doctors", "/admin/doctors", Stethoscope], ["Patients", "/admin/patients", UserRoundCheck], ["MRI Analyses", "/admin/analyses", ScanLine], ["AI Models", "/admin/models", Cpu], ["Datasets", "/admin/datasets", Database], ["Validation", "/admin/validation", ShieldCheck], ["Reports", "/admin/reports", FileText], ["System Analytics", "/admin/analytics", BarChart3], ["Geographic Map", "/admin/map", MapPinned], ["Audit Logs", "/admin/audit-logs", ClipboardList], ["Security", "/admin/security", LockKeyhole], ["Settings", "/admin/settings", Settings],
] as const;

export function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  if (isLoading) return <div className="min-h-screen bg-[#070b14]" />;
  if (!user || user.role !== "Admin") return <Navigate to="/login" replace />;
  const exit = () => { logout(); navigate("/login", { replace: true }); };
  return <div className="min-h-screen bg-[#070b14] text-slate-100 flex">
    <aside className="hidden lg:flex w-72 shrink-0 min-h-screen sticky top-0 flex-col border-r border-slate-800 bg-[#0a1020]">
      <div className="p-6 border-b border-slate-800"><div className="flex gap-3 items-center"><div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500"><BrainCircuit className="w-6 h-6" /></div><div><p className="font-bold tracking-wide">BrainTumorVision AI</p><p className="text-[10px] uppercase tracking-[.18em] text-sky-400">Administration Console</p></div></div></div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navigation.map(([label, to, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-sky-500 text-white shadow-lg shadow-sky-900/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}><Icon className="w-4 h-4" />{label}</NavLink>)}</nav>
      <div className="p-4 border-t border-slate-800"><NavLink to="/admin/profile" className="flex gap-3 items-center rounded-lg p-2 hover:bg-slate-800"><div className="h-9 w-9 rounded-full grid place-items-center bg-sky-500/20 text-sky-300 font-bold">{user.full_name[0]}</div><div className="min-w-0"><p className="text-sm truncate">{user.full_name}</p><p className="text-xs text-emerald-400">Administrator</p></div></NavLink><button onClick={exit} className="mt-3 w-full text-sm flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300"><LogOut className="w-4 h-4" />Logout</button></div>
    </aside>
    <section className="min-w-0 flex-1"><header className="h-16 sticky top-0 z-20 flex items-center justify-between px-5 sm:px-8 border-b border-slate-800 bg-[#0a1020]/95 backdrop-blur"><div className="flex items-center gap-2 text-sm text-slate-400"><Activity className="w-4 h-4 text-emerald-400" />System status <span className="text-emerald-400">Operational</span></div><div className="text-xs rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-300">ADMINISTRATOR SESSION</div></header><main className="p-5 sm:p-8 max-w-[1600px] mx-auto"><Outlet /></main></section>
  </div>;
}
