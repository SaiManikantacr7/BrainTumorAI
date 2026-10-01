"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  FileText,
  Sliders,
  ChevronRight,
  Maximize2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { MRIViewer, ModalityType, OverlayType } from "@/components/mri/MRIViewer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { CLINICAL_SAFETY } from "@/lib/demo-data";

export default function AnalysisWorkspacePage({ params }: { params: { id: string } }) {
  const [selectedModality, setSelectedModality] = useState<ModalityType>("T1CE");
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>("segmentation");

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <DisclaimerBanner variant="warning" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan">
            <span>STUDY: BRAIN-MRI-2026-A1</span>
            <span>•</span>
            <span className="text-slate-400">PATIENT: P-1001</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-0.5">MRI Clinical Analysis Workspace</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/results/demo"
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Detailed Results</span>
          </Link>

          <Link
            href="/reports"
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-blue transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* 3-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Modal / Sequence List & Acquisition Details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Modality Sequences</h3>
            <div className="space-y-2">
              {[
                { id: "T1CE", name: "T1-CE Contrast", desc: "Gadobutrol axial 1mm", status: "Primary" },
                { id: "FLAIR", name: "T2-FLAIR", desc: "Suppressed CSF axial", status: "Edema" },
                { id: "T2", name: "T2-Weighted", desc: "Fast spin-echo axial", status: "Fluids" },
                { id: "T1", name: "T1-Weighted", desc: "Spin-echo baseline", status: "Anatomy" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModality(m.id as ModalityType)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    selectedModality === m.id
                      ? "bg-primary/20 border-primary text-white"
                      : "bg-navy-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-navy-850"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{m.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-navy-900 text-cyan">
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 font-mono text-[11px] uppercase">Scanner Metadata</h4>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between"><span>Scanner:</span><strong className="text-slate-200">Siemens 3.0T</strong></div>
              <div className="flex justify-between"><span>Coil:</span><strong className="text-slate-200">64-Ch Head Neck</strong></div>
              <div className="flex justify-between"><span>Slice Count:</span><strong className="text-slate-200">24 Slices</strong></div>
              <div className="flex justify-between"><span>Voxel Grid:</span><strong className="text-slate-200">1.0 × 1.0 × 1.0 mm</strong></div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Medical MRI Viewer */}
        <div className="lg:col-span-6 space-y-3">
          <MRIViewer
            initialModality={selectedModality}
            initialOverlay={activeOverlay}
            showControls={true}
          />
          <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Left click and drag to pan • Scroll to navigate slices</span>
            <span className="text-primary font-mono font-semibold">Slice 14 / 24</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time AI Results Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-primary">Model Prediction</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Calibrated
              </span>
            </div>
          <div className="flex justify-center my-4">
            <button
              onClick={() => {
                // TODO: invoke backend analysis endpoint
                console.log('Run analysis clicked');
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition"
            >
              Run Analysis
            </button>
          </div>
            {/* Prediction Label */}
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">Glioma</div>
              <div className="text-xs text-slate-400">Model prediction — not clinical certainty</div>
            </div>

            {/* Confidence & Uncertainty */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Model Confidence:</span>
                <span className="font-mono font-bold text-primary">95.8%</span>
              </div>
              <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                <div className="w-[95.8%] h-full bg-primary" />
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">Uncertainty Level:</span>
                <span className="font-mono font-bold text-emerald-400">Low (0.042)</span>
              </div>
            </div>

            {/* Volumetric & Segmentation Metrics */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Segmented Volume:</span>
                <span className="font-mono font-bold text-cyan">14.8 cm³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Segmentation Dice:</span>
                <span className="font-mono font-bold text-slate-200">0.921</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IoU Score:</span>
                <span className="font-mono font-bold text-slate-200">0.854</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Grade:</span>
                <span className="font-mono text-purple-accent font-semibold">High-Grade (WHO III-IV)</span>
              </div>
            </div>

            {/* Switch Overlay Shortcut */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">Switch Visual Layer:</label>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  onClick={() => setActiveOverlay("segmentation")}
                  className={`p-1.5 rounded text-center border font-medium ${
                    activeOverlay === "segmentation" ? "bg-purple-accent/20 border-purple-accent text-purple-300" : "bg-navy-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Segmentation
                </button>
                <button
                  onClick={() => setActiveOverlay("gradcam")}
                  className={`p-1.5 rounded text-center border font-medium ${
                    activeOverlay === "gradcam" ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-navy-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Grad-CAM
                </button>
                <button
                  onClick={() => setActiveOverlay("shap")}
                  className={`p-1.5 rounded text-center border font-medium ${
                    activeOverlay === "shap" ? "bg-cyan/20 border-cyan text-cyan" : "bg-navy-950 border-slate-800 text-slate-400"
                  }`}
                >
                  SHAP
                </button>
                <button
                  onClick={() => setActiveOverlay("attention")}
                  className={`p-1.5 rounded text-center border font-medium ${
                    activeOverlay === "attention" ? "bg-primary/20 border-primary text-primary" : "bg-navy-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Attention
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Research Protocol Requirement</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed">
              Volumetric contours must be verified against PACS calipers before recording into clinical trial CRF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

