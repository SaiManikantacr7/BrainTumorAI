import React from "react";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

interface DisclaimerBannerProps {
  variant?: "warning" | "compact" | "critical";
  className?: string;
}

export function DisclaimerBanner({ variant = "warning", className = "" }: DisclaimerBannerProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Research Prototype — AI-generated results require qualified clinician review.</span>
      </div>
    );
  }

  if (variant === "critical") {
    return (
      <div className={`p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start gap-3 shadow-glow-alert ${className}`}>
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-red-300">Clinical Decision Support Notice — Non-Diagnostic</div>
          <p className="text-xs text-red-200/80 leading-relaxed">
            BrainTumorVision AI is an investigational decision-support research system and is not approved as an independent diagnostic medical device. 
            Never present AI predictions as a confirmed medical diagnosis. AI-generated results require qualified clinician review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-lg bg-navy-850 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-amber-200 uppercase tracking-wide text-[11px] block">Research Prototype Notice</span>
          <span className="text-slate-300">AI-generated results are investigational estimates and require qualified clinician review. Never use as an unverified diagnosis.</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded bg-navy-950 border border-slate-700 text-slate-400 font-mono flex-shrink-0">
        <Info className="w-3 h-3 text-cyan" />
        <span>DEMO MODE ACTIVE</span>
      </div>
    </div>
  );
}
