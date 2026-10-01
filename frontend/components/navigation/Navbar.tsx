"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ShieldAlert, Sparkles, Activity, Bell } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export function Navbar() {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Context badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-navy-850 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-clinical-positive animate-pulse" />
          <span className="text-slate-400 font-mono">PROTOCOL:</span>
          <span className="font-semibold text-slate-200">BRAIN-TUMOR-MULTIMODAL-v1.3</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">T1</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/30">T2</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-accent/10 text-purple-accent border border-purple-accent/30">FLAIR</span>
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">T1-CE</span>
        </div>
      </div>

      {/* Center: Clinical Prototype Disclaimer */}
      <div className="hidden lg:block max-w-md">
        <DisclaimerBanner variant="compact" />
      </div>

      {/* Right side: Quick Action & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-navy-900 border border-slate-800 text-[11px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan" />
          <span className="font-mono">Inference Engine: <strong className="text-slate-200">Online</strong></span>
        </div>

        <Link
          href="/analysis/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-blue transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>
    </header>
  );
}

