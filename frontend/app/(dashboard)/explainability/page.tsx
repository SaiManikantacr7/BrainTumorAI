"use client";

import React, { useState } from "react";
import { Sparkles, Eye, Info, Layers, Sliders, ShieldAlert } from "lucide-react";
import { MRIViewer, OverlayType } from "@/components/mri/MRIViewer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { CLINICAL_SAFETY } from "@/lib/demo-data";

export default function ExplainabilityPage() {
  const [activeXAI, setActiveXAI] = useState<OverlayType>("gradcam");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <DisclaimerBanner variant="critical" />

      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Explainable AI (XAI) Workbench</h1>
        <p className="text-xs text-slate-400 mt-1">
          Visualizing internal feature representations, attention rollout weights, and local Shapley attribution values.
        </p>
      </div>

      {/* Legal XAI Notice */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-cyan flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          <span>Explainability Interpretability Guideline</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          {CLINICAL_SAFETY.xai_disclaimer}
        </p>
      </div>

      {/* Main Interactive XAI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <MRIViewer initialModality="T1CE" initialOverlay={activeXAI} showControls={true} />
        </div>

        {/* Right: Method Controls & Explanations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Method Selector Tabs */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase font-mono">Select Explainability Method:</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              {[
                { id: "gradcam", label: "Grad-CAM", desc: "Gradient Salience" },
                { id: "shap", label: "SHAP", desc: "Feature Attribution" },
                { id: "attention", label: "Cross-Attention", desc: "Token Weights" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveXAI(m.id as OverlayType)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    activeXAI === m.id
                      ? "bg-purple-accent/20 border-purple-accent text-purple-300 font-bold shadow-glow-purple"
                      : "bg-navy-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs">{m.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details for current method */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            {activeXAI === "gradcam" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Grad-CAM (Gradient-Weighted Class Activation Mapping)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Computes the gradients of the target class score with respect to the final convolutional feature maps of EfficientNet-B4. Red/yellow peaks highlight regions of high positive gradient activation.
                </p>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Peak Activation: <strong className="text-amber-400">0.984</strong></div>
                  <div>Anatomical Target: <strong className="text-white">Right Frontal Parenchyma</strong></div>
                </div>
              </div>
            )}

            {activeXAI === "shap" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
                  <span>SHAP (SHapley Additive exPlanations)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on cooperative game theory, attributing each voxel cluster&apos;s marginal contribution to pushing the prediction toward &ldquo;Glioma&rdquo;.
                </p>
                <div className="space-y-2 pt-2">
                  {[
                    { name: "T1-CE Enhancing Rim", impact: "+0.44", color: "text-primary" },
                    { name: "FLAIR Vasogenic Edema", impact: "+0.32", color: "text-cyan" },
                    { name: "Necrotic Hypointense Core", impact: "+0.18", color: "text-purple-accent" },
                  ].map((f, i) => (
                    <div key={i} className="p-2 rounded bg-navy-950 border border-slate-800 flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{f.name}</span>
                      <span className={`font-bold ${f.color}`}>{f.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeXAI === "attention" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-accent" />
                  <span>Cross-Attention Rollout Map</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visualizes the attention weights computed across the 4 MRI modalities, demonstrating where the network establishes cross-sequence associations between contrast enhancement and edema.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">T1-CE WEIGHT</span>
                    <strong className="text-primary">42%</strong>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">FLAIR WEIGHT</span>
                    <strong className="text-cyan">34%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

