"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Activity,
  Sparkles,
  ShieldAlert,
  FileText,
  Sliders,
  ChevronRight,
  Eye,
  CheckCircle2,
  Info,
  Layers,
} from "lucide-react";
import { MRIViewer, OverlayType } from "@/components/mri/MRIViewer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { CLINICAL_SAFETY } from "@/lib/demo-data";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"summary" | "segmentation" | "xai" | "metrics">("summary");
  const [activeXAIOverlay, setActiveXAIOverlay] = useState<OverlayType>("gradcam");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <DisclaimerBanner variant="critical" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan">
            <span>ANALYSIS RESULT ID: RES-2026-9481</span>
            <span>•</span>
            <span className="text-slate-400">PATIENT: P-1001</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Multimodal Brain MRI Findings</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analysis/demo"
            className="px-3.5 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-cyan" />
            <span>Interactive Viewer</span>
          </Link>

          <Link
            href="/reports"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Clinical Report</span>
          </Link>
        </div>
      </div>

      {/* TOP PRIMARY PREDICTION & UNCERTAINTY CARD (Section 11) */}
      <div className="p-6 md:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Inference */}
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold">
              AI INFERENCE SUMMARY
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-mono">Predicted Intracranial Lesion:</div>
              <div className="text-4xl font-black text-white">Glioma</div>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Model confidence — not clinical certainty</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This output represents a statistical probability estimate calculated from multi-center trained neural networks. It must not be interpreted as an autonomous medical diagnosis.
              </p>
            </div>
          </div>

          {/* Calibrated Confidence & Uncertainty Gauge */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">MODEL CONFIDENCE:</span>
              <span className="text-2xl font-black font-mono text-primary">95.8%</span>
            </div>
            <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
              <div className="w-[95.8%] h-full bg-primary shadow-glow-blue" />
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">UNCERTAINTY:</span>
                <span className="text-emerald-400 font-bold">Low (0.042)</span>
              </div>
              <div>
                <span className="text-slate-500 block">CALIBRATION:</span>
                <span className="text-cyan font-bold">ECE 0.024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Sub-attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="text-[11px] text-slate-500 font-mono">ESTIMATED VOLUME</div>
            <div className="text-lg font-bold font-mono text-cyan mt-0.5">14.8 cm³</div>
            <div className="text-[10px] text-slate-400">Continuous 3D contour</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="text-[11px] text-slate-500 font-mono">ESTIMATED GRADE</div>
            <div className="text-sm font-bold text-purple-accent mt-0.5">High-Grade (WHO III-IV)</div>
            <div className="text-[10px] text-slate-400">Model estimate</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="text-[11px] text-slate-500 font-mono">ANATOMICAL LOCATION</div>
            <div className="text-sm font-bold text-white mt-0.5">Right Frontal-Temporal</div>
            <div className="text-[10px] text-slate-400">Axial slice 14/24</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <div className="text-[11px] text-slate-500 font-mono">SEGMENTATION DICE</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">0.921</div>
            <div className="text-[10px] text-slate-400">IoU Overlap: 0.854</div>
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Breakdown */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800 text-xs font-medium gap-6">
          {[
            { id: "summary", label: "Volumetric Overview" },
            { id: "segmentation", label: "Segmentation Contours" },
            { id: "xai", label: "Explainable AI (Grad-CAM & SHAP)" },
            { id: "metrics", label: "Validation & Uncertainty Metrics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 relative font-bold transition-all ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SUMMARY / VOLUMETRIC */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <MRIViewer initialModality="T1CE" initialOverlay="segmentation" showControls={false} />
            </div>
            <div className="lg:col-span-6 space-y-4 text-xs text-slate-300">
              <h3 className="text-base font-bold text-white">Anatomical & Volumetric Characterization</h3>
              <p className="text-slate-400 leading-relaxed">
                The multimodal neural network synthesized features across T1, T2, FLAIR, and contrast-enhanced T1 sequences to segment intracranial tissue compartments:
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <strong className="text-white">Enhancing Tumor Core (T1-CE):</strong>
                  </span>
                  <span className="font-mono text-primary font-bold">8.4 cm³ (56.8%)</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan" />
                    <strong className="text-white">Vasogenic Peritumoral Edema (FLAIR):</strong>
                  </span>
                  <span className="font-mono text-cyan font-bold">6.4 cm³ (43.2%)</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800 text-[11px] text-slate-400">
                Total Segmented Intracranial Lesion Volume: <strong className="text-white">14.8 cm³</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEGMENTATION */}
        {activeTab === "segmentation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <MRIViewer initialModality="T1CE" initialOverlay="segmentation" showControls={true} />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-base font-bold text-white">Attention U-Net Boundary Evaluation</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Dice Similarity Coefficient (DSC):</span>
                    <span className="font-mono font-bold text-emerald-400">0.921</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Intersection over Union (Jaccard Index):</span>
                    <span className="font-mono font-bold text-slate-200">0.854</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Voxel Sensitivity (True Positive Rate):</span>
                    <span className="font-mono font-bold text-slate-200">0.938</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Voxel Specificity (True Negative Rate):</span>
                    <span className="font-mono font-bold text-slate-200">0.989</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXPLAINABLE AI */}
        {activeTab === "xai" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-cyan block mb-1">Explainability Notice:</strong>
              {CLINICAL_SAFETY.xai_disclaimer}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6">
                <MRIViewer initialModality="T1CE" initialOverlay={activeXAIOverlay} showControls={true} />
              </div>
              <div className="lg:col-span-6 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveXAIOverlay("gradcam")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      activeXAIOverlay === "gradcam" ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-navy-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Grad-CAM Salience
                  </button>
                  <button
                    onClick={() => setActiveXAIOverlay("shap")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      activeXAIOverlay === "shap" ? "bg-cyan/20 border-cyan text-cyan" : "bg-navy-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    SHAP Attribution
                  </button>
                  <button
                    onClick={() => setActiveXAIOverlay("attention")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      activeXAIOverlay === "attention" ? "bg-primary/20 border-primary text-primary" : "bg-navy-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Cross-Attention Rollout
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-white">Dominant Morphological Contributors (SHAP):</h4>
                  <div className="space-y-1.5">
                    {[
                      { name: "Hyperintense rim enhancement on T1-CE sequence", weight: "+0.44", color: "text-primary" },
                      { name: "Perilesional vasogenic edema observed in FLAIR", weight: "+0.32", color: "text-cyan" },
                      { name: "Central hypointense core indicative of potential necrosis", weight: "+0.18", color: "text-purple-accent" },
                      { name: "Contralateral hemispheric shift and mass effect", weight: "+0.06", color: "text-amber-400" },
                    ].map((f, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">{f.name}</span>
                        <span className={`font-mono font-bold ${f.color}`}>{f.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: METRICS */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <span className="text-slate-500 uppercase">Latency</span>
              <div className="text-2xl font-bold text-white">418.2 ms</div>
              <div className="text-[11px] text-slate-400">Total forward inference pass</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <span className="text-slate-500 uppercase">Model Parameters</span>
              <div className="text-2xl font-bold text-cyan">19.3 Million</div>
              <div className="text-[11px] text-slate-400">EfficientNet-B4 + Attention</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <span className="text-slate-500 uppercase">Shannon Entropy</span>
              <div className="text-2xl font-bold text-emerald-400">0.038 nats</div>
              <div className="text-[11px] text-slate-400">Calibrated distribution spread</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

