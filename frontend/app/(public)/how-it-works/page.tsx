"use client";

import React from "react";
import Link from "next/link";
import {
  UploadCloud,
  Layers,
  Sparkles,
  Cpu,
  Brain,
  Eye,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Multimodal MRI Ingestion",
    icon: UploadCloud,
    description: "Accepts synchronized T1, T2, FLAIR, and T1-CE axial sequences in standard medical image formats or DICOM archives.",
    details: ["Supports 1.5T and 3.0T scanner acquisitions", "Automatic slice integrity and spacing validation", "Metadata anonymization and de-identification"],
  },
  {
    step: "02",
    title: "Clinical Preprocessing & Skull Stripping",
    icon: Layers,
    description: "Applies N4 bias field correction, skull stripping mask generation, and Z-score intensity normalization to ensure scanner invariance.",
    details: ["Removes RF field inhomogeneities", "Intracranial brain parenchyma isolation", "Isotropic 1.0mm³ spatial resampling"],
  },
  {
    step: "03",
    title: "Cross-Attention Multimodal Fusion",
    icon: Sparkles,
    description: "Instead of naive channel stacking, a dedicated cross-attention module queries complementary anatomical features across sequences.",
    details: ["T1-CE highlights blood-brain barrier disruption", "FLAIR isolates vasogenic peritumoral edema", "T2 illuminates cellular fluid composition"],
  },
  {
    step: "04",
    title: "Detection & Sub-Type Classification",
    icon: Brain,
    description: "Deep convolutional backbone (EfficientNet-B4 / ConvNeXt) categorizes the scan into Glioma, Meningioma, Pituitary, or No Tumor.",
    details: ["Calibrated softmax probabilities", "Uncertainty quantification via Shannon entropy", "WHO histologic grade estimation"],
  },
  {
    step: "05",
    title: "Voxel-Level 3D Segmentation & Volumetry",
    icon: Activity,
    description: "Attention U-Net delineates precise lesion boundaries voxel-by-voxel, computing continuous volumetric metrics in cubic centimeters ($cm^3$).",
    details: ["Automatic Dice & IoU score tracking", "Delineates enhancing rim and necrotic core", "Continuous volumetric monitoring over time"],
  },
  {
    step: "06",
    title: "Explainable AI (XAI) & Report Generation",
    icon: Eye,
    description: "Generates interpretable Grad-CAM salience heatmaps and SHAP tissue attribution vectors alongside printable PDF clinical research reports.",
    details: ["Visual justification of prediction features", "Domain shift sensitivity indicators", "Clinician human-in-the-loop review sign-off"],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold">
          END-TO-END INFERENCE PIPELINE
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">How the BrainTumorVision AI Pipeline Works</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Explore the rigorous architectural stages transforming raw brain MRI sequences into calibrated, explainable decision-support findings.
        </p>
      </div>

      <DisclaimerBanner variant="critical" />

      {/* Pipeline Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PIPELINE_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 relative flex flex-col justify-between group hover:border-primary/50 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-primary/40 transition-colors">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                {s.details.map((d, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-cyan flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner */}
      <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Test the Pipeline with Synthetic or Real Scans</h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Our platform operates in instant demo mode or directly connects to your local hospital research server.
        </p>
        <Link
          href="/analysis/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
        >
          <span>Run Multimodal Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
