"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Brain,
  Sparkles,
  LineChart,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { MRIViewer } from "@/components/mri/MRIViewer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12 px-6 md:px-12 max-w-7xl mx-auto">
      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6">
        <div className="lg:col-span-7 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span>Multimodal Neuro-Oncology Research Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Smarter Brain Analysis.{" "}
            <span className="bg-gradient-to-r from-primary via-cyan to-purple-accent bg-clip-text text-transparent">
              Explainable AI for MRI.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            An AI-powered research platform for multimodal brain MRI analysis, tumor classification, 3D boundary segmentation, and transparent explainability.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/analysis/new"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-glow-blue transition-all transform hover:-translate-y-0.5"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/research"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold transition-all"
            >
              <span>Explore Research</span>
            </Link>
          </div>

          {/* Clinical Disclaimer Callout */}
          <DisclaimerBanner variant="critical" />
        </div>

        {/* Hero Interactive Medical Viewer Preview */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-cyan/20 to-purple-accent/30 blur-xl opacity-60 pointer-events-none" />
          <div className="relative">
            <MRIViewer initialModality="T1CE" initialOverlay="segmentation" showControls={true} />
            <div className="mt-2 text-center text-[11px] font-mono text-slate-400">
              Interactive Viewer: Toggle Modalities (T1, T2, FLAIR, T1-CE) & AI Overlays
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (6 FEATURE CARDS) */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">Platform Capabilities</div>
          <h2 className="text-3xl font-extrabold text-white">Engineered for Medical AI Precision</h2>
          <p className="text-slate-400 text-sm">
            Bridging state-of-the-art deep learning with clinical interpretability and multi-sequence MRI protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-primary/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">1. Multimodal MRI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synchronized multi-parametric processing supporting <strong>T1, T2, FLAIR, and T1-CE</strong> contrast sequences with cross-attention feature fusion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan transition-colors">2. AI Detection & Typing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classifies lesion category across <strong>Glioma, Meningioma, Pituitary, or No Tumor</strong> with temperature-calibrated uncertainty bounds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-purple-accent/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-accent/10 border border-purple-accent/30 flex items-center justify-center text-purple-accent group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-accent transition-colors">3. Segmentation & Volumetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3D Attention U-Net segments enhancing core and peritumoral edema, automatically deriving exact quantitative volume ($cm^3$).
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">4. Explainable AI (XAI)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect model rationale via <strong>Grad-CAM</strong> salience maps, <strong>SHAP</strong> tissue attributions, and cross-attention weight rollouts.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">5. Longitudinal Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Surveillance timelines trace volumetric changes over sequential scans (e.g. Jan → Apr → Jul → Sep) to monitor model-observed progression.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-blue-400/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">6. External Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rigorous cross-institution evaluation with Domain Shift analysis across GE, Siemens, and Philips scanners at 1.5T and 3.0T.
            </p>
          </div>
        </div>
      </section>

      {/* 3. RESEARCH BENCHMARK SUMMARY */}
      <section className="rounded-3xl bg-navy-900 border border-slate-800 p-8 md:p-12 relative overflow-hidden">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold">
            EVALUATED ON BRATS 2023 BENCHMARK
          </div>
          <h2 className="text-3xl font-extrabold text-white">Multimodal Fusion Outperforms Single-Sequence Models</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            By fusing complementary magnetic resonance sequences through cross-attention gating, BrainTumorVision AI achieves a 92.4% Dice score on challenging heterogeneous glioblastomas while maintaining sub-second inference speeds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
            <div>
              <div className="text-3xl font-black text-primary">96.2%</div>
              <div className="text-xs text-slate-400 font-mono">Classification Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-black text-cyan">0.924</div>
              <div className="text-xs text-slate-400 font-mono">Average Dice (DSC)</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-accent">385 ms</div>
              <div className="text-xs text-slate-400 font-mono">Inference Latency</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-400">0.024</div>
              <div className="text-xs text-slate-400 font-mono">Calibration ECE</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="text-center py-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-white">Ready to inspect brain MRI with explainable AI?</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Experience our complete decision-support workstation with instant demo data or upload your research scans.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-glow-blue transition-all"
          >
            Launch Research Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
