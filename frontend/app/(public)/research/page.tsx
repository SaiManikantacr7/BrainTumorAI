"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, ShieldCheck, Cpu, Database, Award } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function ResearchPage() {
  return (
    <div className="py-12 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold">
          PEER-REVIEWED METHODOLOGY & DATASETS
        </div>
        <h1 className="text-4xl font-black text-white">Research & Validation Framework</h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          BrainTumorVision AI is grounded in multi-center neuro-oncology benchmarks, cross-attention feature representations, and rigorous external domain-shift validation protocols.
        </p>
      </div>

      <DisclaimerBanner variant="warning" />

      {/* Methodology Papers & Benchmarks */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>Core Academic Benchmarks & Citations</span>
        </h2>

        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan font-bold">BraTS 2023 Cohort</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">Benchmark Data</span>
            </div>
            <h3 className="text-sm font-bold text-white">The Brain Tumor Segmentation (BraTS) Challenge 2023</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized multi-institutional pre-operative brain MRI scans spanning glioblastoma, diffuse astrocytoma, and lower-grade gliomas across multiple clinical centers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-accent font-bold">TCIA Glioblastoma</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-accent/10 text-purple-accent border border-purple-accent/30">External Validation</span>
            </div>
            <h3 className="text-sm font-bold text-white">The Cancer Imaging Archive (TCIA) Heterogeneous MR Scans</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-world clinical MR scans with variable field strengths (1.5T & 3.0T), non-uniform contrast delays, and diverse coil geometries used for out-of-distribution evaluation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">XAI Foundations</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Explainability</span>
            </div>
            <h3 className="text-sm font-bold text-white">Grad-CAM: Visual Explanations from Deep Networks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gradient-weighted class activation mapping computes rectified gradients with respect to convolutional feature maps, visually attributing prediction weight to specific intracranial anatomical locations.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Attention Multimodal Architecture */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Why Multimodal Cross-Attention?</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          In clinical neuro-radiology, no single MRI modality provides a complete diagnostic picture:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
            <strong className="text-blue-400 block mb-1">T1-Weighted:</strong>
            Highlights anatomical boundaries and distinguishes grey from white matter. Central necrotic cores appear characteristically hypointense.
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
            <strong className="text-cyan block mb-1">T2-Weighted:</strong>
            Demonstrates water and fluid hyperintensity, isolating fluid accumulation and cellular infiltration across brain parenchyma.
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
            <strong className="text-purple-accent block mb-1">T2-FLAIR:</strong>
            Suppresses cerebrospinal fluid (CSF) signal in ventricles, making peritumoral vasogenic edema stand out sharply.
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
            <strong className="text-primary block mb-1">T1-CE (Contrast Enhanced):</strong>
            Gadolinium contrast highlights blood-brain barrier breakdown, producing the classic ring-enhancing margin characteristic of high-grade lesions.
          </div>
        </div>
      </div>
    </div>
  );
}
