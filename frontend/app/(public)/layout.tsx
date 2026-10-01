"use client";

import React from "react";
import Link from "next/link";
import { BrainCircuit, ShieldAlert, Github } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-primary selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-navy-900 border-b border-slate-800 text-[11px] text-slate-400 py-1.5 px-4 text-center">
        <span className="text-amber-400 font-semibold mr-1.5">INVESTIGATIONAL PROTOTYPE:</span>
        BrainTumorVision AI is an educational & clinical research prototype, not a medical diagnostic device. AI results require qualified clinician review.
      </div>

      {/* Public Header */}
      <header className="h-16 border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-cyan to-purple-accent flex items-center justify-center shadow-glow-blue">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
              BrainTumorVision <span className="text-cyan text-xs font-mono px-1.5 py-0.5 rounded bg-cyan/10 border border-cyan/30">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">Explainable Multimodal Brain MRI</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="/research" className="hover:text-primary transition-colors">Research</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-200 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-blue transition-all"
          >
            <span>Sign Up</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 bg-navy-950 py-12 px-6 md:px-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <span>BrainTumorVision AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Explainable Multimodal Brain MRI Analysis Platform for clinical research, tumor segmentation, and longitudinal surveillance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-primary">Clinical Dashboard</Link></li>
              <li><Link href="/analysis/new" className="hover:text-primary">Multimodal Upload</Link></li>
              <li><Link href="/models" className="hover:text-primary">Model Intelligence</Link></li>
              <li><Link href="/validation" className="hover:text-primary">External Validation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Research & Ethics</h4>
            <ul className="space-y-2">
              <li><Link href="/research" className="hover:text-primary">BraTS 2023 Benchmark</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary">Explainable AI (XAI)</Link></li>
              <li><Link href="/research-lab" className="hover:text-primary">Ablation Studies</Link></li>
              <li><Link href="/about" className="hover:text-primary">Ethical AI Mandate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Clinical Disclaimer</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Research Prototype — AI-generated results require qualified clinician review. This system is for scientific evaluation and clinical decision-support only.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 BrainTumorVision AI. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-slate-300">Privacy & De-identification</Link>
            <Link href="/about" className="hover:text-slate-300">Terms of Research Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
