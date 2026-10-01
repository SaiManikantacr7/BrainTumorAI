"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Eye,
  Activity,
  Users,
  LineChart,
  MapPinned,
  HeartPulse,
  Cpu,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  FileText,
  Settings,
  BrainCircuit,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Analysis", href: "/analysis/new", icon: PlusCircle, highlight: true },
  { label: "MRI Workspace", href: "/analysis/demo", icon: Eye },
  { label: "Analysis Results", href: "/results/demo", icon: Activity },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Longitudinal Timeline", href: "/patients/P-1001/timeline", icon: LineChart },
  { label: "Model Intelligence", href: "/models", icon: Cpu },
  { label: "External Validation", href: "/validation", icon: ShieldCheck },
  { label: "Explainable AI (XAI)", href: "/explainability", icon: Sparkles },
  { label: "Research Lab", href: "/research-lab", icon: FlaskConical },
  { label: "Geographic Map", href: "/map", icon: MapPinned },
  { label: "Wellness", href: "/wellness", icon: HeartPulse },
  { label: "Clinical Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-cyan to-purple-accent flex items-center justify-center shadow-glow-blue">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wider text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                BrainTumorVision <span className="text-cyan text-xs font-mono px-1.5 py-0.5 rounded bg-cyan/10 border border-cyan/30">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">Explainable Multimodal MRI</div>
            </div>
          </Link>
        </div>

        {/* Clinical Disclaimer Pill */}
        <div className="px-3.5 pt-3">
          <div className="px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Research Prototype • Non-Diagnostic</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-primary text-white shadow-glow-blue font-semibold"
                    : item.highlight
                    ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-navy-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-primary" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono font-bold uppercase">New</span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Role Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-navy-950/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-navy-850/80 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {user?.full_name ? user.full_name[0] : "R"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || "Dr. Sarah Chen"}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan font-mono">{user?.role || "User"}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[9px] text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
}
