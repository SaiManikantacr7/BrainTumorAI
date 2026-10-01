"use client";

import React, { useRef } from "react";
import { Printer, Download, ShieldAlert, BrainCircuit, CheckCircle2, FileText } from "lucide-react";
import { MRI_SVGS, CLINICAL_SAFETY } from "@/lib/demo-data";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function ReportsPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="print:hidden">
        <DisclaimerBanner variant="critical" />
      </div>

      {/* Header bar with Print & Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white">Clinical Research Report Generator</h1>
          <p className="text-xs text-slate-400">Standardized neuro-oncology multimodal findings export.</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* PRINTABLE REPORT DOCUMENT (Medical Grade Format) */}
      <div
        ref={printRef}
        className="bg-navy-900 print:bg-white print:text-black border border-slate-800 print:border-none rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl text-slate-100"
      >
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 print:border-slate-300 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-wider text-white print:text-black">BrainTumorVision AI</span>
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Explainable Multimodal Brain MRI Research Platform
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600 space-y-0.5">
            <div>REPORT ID: <strong className="text-primary print:text-black">REP-202609-A482F</strong></div>
            <div>DATE: September 22, 2026</div>
            <div>STATUS: <span className="text-emerald-400 font-bold">VERIFIED COHORT</span></div>
          </div>
        </div>

        {/* Clinical Disclaimer Callout Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 print:border-amber-600 text-amber-300 print:text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">MANDATORY RESEARCH DISCLAIMER:</strong>
            {CLINICAL_SAFETY.prototype_disclaimer} This document does not constitute a certified medical diagnosis or independent prescription.
          </div>
        </div>

        {/* Study Demographics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-navy-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] block">PATIENT ID</span>
            <strong className="text-slate-200 print:text-black">P-1001</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">AGE / SEX</span>
            <strong className="text-slate-200 print:text-black">54y • Female</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">SCANNER PROTOCOL</span>
            <strong className="text-slate-200 print:text-black">Siemens Vida 3.0T</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">SEQUENCES</span>
            <strong className="text-cyan print:text-blue-700">T1, T2, FLAIR, T1-CE</strong>
          </div>
        </div>

        {/* Primary Model Findings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono">
            1. Multimodal Model Inference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Model Prediction:</span>
                <strong className="text-white print:text-black font-bold">Glioma</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Calibrated Confidence:</span>
                <strong className="text-primary print:text-blue-700 font-mono">95.8% (Low Uncertainty)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Histologic Grade Estimate:</span>
                <strong className="text-purple-accent print:text-purple-800">High-Grade (WHO III-IV)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Lesion Center:</span>
                <strong className="text-slate-200 print:text-black">Right Frontal-Temporal Lobe</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Segmented Volume:</span>
                <strong className="text-cyan print:text-cyan-800 font-mono">14.8 cm³</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Segmentation Dice Overlap:</span>
                <strong className="text-emerald-400 print:text-emerald-700 font-mono">0.921</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Intersection over Union (IoU):</span>
                <strong className="text-slate-200 print:text-black font-mono">0.854</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Volumetric Surface Area:</span>
                <strong className="text-slate-200 print:text-black font-mono">2,540 mm²</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded MRI Visual Evidence Slices (Section 21) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono">
            2. Radiologic Visual Evidence
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 text-center">
              <div className="h-44 rounded-xl bg-black overflow-hidden border border-slate-800 relative">
                <img src={MRI_SVGS.T1CE} alt="T1-CE Original" className="w-full h-full object-contain" />
              </div>
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 font-bold">T1-CE Contrast MRI</div>
            </div>

            <div className="space-y-1.5 text-center">
              <div className="h-44 rounded-xl bg-black overflow-hidden border border-slate-800 relative">
                <img src={MRI_SVGS.T1CE} alt="T1-CE" className="w-full h-full object-contain" />
                <img src={MRI_SVGS.SEGMENTATION} alt="Segmentation Mask" className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-75" />
              </div>
              <div className="text-[11px] font-mono text-cyan print:text-cyan-800 font-bold">Attention U-Net Mask</div>
            </div>

            <div className="space-y-1.5 text-center">
              <div className="h-44 rounded-xl bg-black overflow-hidden border border-slate-800 relative">
                <img src={MRI_SVGS.T1CE} alt="T1-CE" className="w-full h-full object-contain" />
                <img src={MRI_SVGS.GRADCAM} alt="Grad-CAM Overlay" className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-70" />
              </div>
              <div className="text-[11px] font-mono text-amber-400 print:text-amber-800 font-bold">Grad-CAM Salience</div>
            </div>
          </div>
        </div>

        {/* Explainability Attributions & Longitudinal Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-navy-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-2">
            <h4 className="font-bold text-white print:text-black font-mono uppercase text-[11px]">Dominant Morphologic Drivers (SHAP)</h4>
            <ul className="space-y-1 text-[11px] text-slate-300 print:text-slate-700">
              <li>• Intense peripheral ring-enhancement visualized on T1-CE (+0.44)</li>
              <li>• Extensive vasogenic edema along white matter tracts on FLAIR (+0.32)</li>
              <li>• Central non-enhancing hypointense necrotic focus on T1 (+0.18)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-2">
            <h4 className="font-bold text-white print:text-black font-mono uppercase text-[11px]">Longitudinal Context (Model-Observed Change)</h4>
            <ul className="space-y-1 text-[11px] text-slate-300 print:text-slate-700">
              <li>• Baseline Study (Jan 2026): <strong>18.6 cm³</strong></li>
              <li>• Current Study (Sep 2026): <strong>12.1 cm³</strong> (-34.9% overall)</li>
              <li>• Status: Model-observed interval reduction with local focal stabilization</li>
            </ul>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>Architecture: BrainTumorVision-EfficientNet-Attention-v1.3.0</div>
          <div className="text-amber-400 print:text-amber-800 font-bold">
            RESEARCH PROTOTYPE — NON-DIAGNOSTIC
          </div>
        </div>
      </div>
    </div>
  );
}
