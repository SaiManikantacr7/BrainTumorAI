"use client";

import React from "react";
import Link from "next/link";
import { BrainCircuit, ShieldAlert, HeartPulse, CheckCircle2, Lock, Scale } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function AboutPage() {
  return (
    <div className="py-12 px-6 md:px-12 max-w-5xl mx-auto space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold">
          MISSION & SAFETY FRAMEWORK
        </div>
        <h1 className="text-4xl font-black text-white">About BrainTumorVision AI</h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          BrainTumorVision AI is an educational and investigational clinical decision-support prototype developed by medical imaging scientists, full-stack engineers, and AI researchers. 
          Our platform is designed to provide transparent, explainable, and multi-parametric insights from complex brain MRI examinations.
        </p>
      </div>

      <DisclaimerBanner variant="critical" />

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-primary">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Human-in-the-Loop</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI is never treated as an autonomous diagnostic authority. All outputs are presented as model predictions and volumetric estimates strictly requiring qualified clinician verification.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-accent/10 border border-purple-accent/30 flex items-center justify-center text-purple-accent">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Interpretability First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Black-box models are unacceptable in neuro-oncology. Every prediction is accompanied by Grad-CAM activation maps, SHAP attribution rankings, and calibrated uncertainty metrics.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Privacy & Ethics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built with zero-exposure de-identification pipelines. No personally identifiable medical records or raw DICOM patient tags are retained or transmitted publicly.
          </p>
        </div>
      </div>

      {/* Statement on Clinical Governance */}
      <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Clinical Research Governance Statement</h2>
        <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
          <p>
            The software architectures, deep learning models (EfficientNet, ConvNeXt, Vision Transformers, and Attention U-Net), and synthetic datasets presented within this application are strictly intended for scientific evaluation, academic benchmark reproducibility, and algorithm validation.
          </p>
          <p>
            This system does not have clearance or approval from the U.S. Food and Drug Administration (FDA) or European CE-Mark as a software-as-a-medical-device (SaMD). It must not be utilized for acute emergency diagnosis, primary triage, or immediate therapeutic surgical decisions without independent radiological board review.
          </p>
        </div>
      </div>
    </div>
  );
}
