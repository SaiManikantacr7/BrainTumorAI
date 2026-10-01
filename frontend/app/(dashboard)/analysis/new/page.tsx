"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Play,
  Cpu,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { MRI_SVGS } from "@/lib/demo-data";
import { apiClient } from "@/lib/api-client";

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  modality: "T1" | "T2" | "FLAIR" | "T1CE";
  preview: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();

  // Wizard state: 1: Upload, 2: Configure, 3: Processing, 4: Complete
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [patientId, setPatientId] = useState<string>("P-1001");

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    { id: "1", name: "P1001_axial_t1.png", size: "2.4 MB", modality: "T1", preview: MRI_SVGS.T1 },
    { id: "2", name: "P1001_axial_t2.png", size: "2.6 MB", modality: "T2", preview: MRI_SVGS.T2 },
    { id: "3", name: "P1001_axial_flair.png", size: "2.8 MB", modality: "FLAIR", preview: MRI_SVGS.FLAIR },
    { id: "4", name: "P1001_axial_t1ce.png", size: "3.1 MB", modality: "T1CE", preview: MRI_SVGS.T1CE },
  ]);

  // Analysis options checkboxes
  const [options, setOptions] = useState({
    detectTumor: true,
    classifyType: true,
    segmentRegion: true,
    estimateGrade: true,
    generateExplainability: true,
    calculateVolume: true,
    comparePrevious: true,
  });

  // Processing simulation state
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [activeStage, setActiveStage] = useState<string>("Preprocessing");
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  const PIPELINE_STAGES = [
    "Preprocessing & Skull Stripping",
    "Feature Extraction",
    "Multimodal Cross-Attention Fusion",
    "Tumor Detection",
    "Tumor Classification (Glioma/Meningioma/Pituitary)",
    "Attention U-Net Boundary Segmentation",
    "WHO Histologic Grade Estimation",
    "Grad-CAM & SHAP Explainability Engine",
    "Clinical Research Report Assembly",
  ];

  const handleToggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartAnalysis = async () => {
    setCurrentStep(3);
    setPipelineProgress(10);
    setActiveStage(PIPELINE_STAGES[0]);

    // Animate through pipeline stages smoothly
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setActiveStage(PIPELINE_STAGES[i]);
      setCompletedStages((prev) => [...prev, PIPELINE_STAGES[i]]);
      setPipelineProgress(Math.round(((i + 1) / PIPELINE_STAGES.length) * 100));
    }

    // Call backend or fallback
    await apiClient.triggerAnalysis({ scan_id: "scan-p1001-01", patient_id: patientId });

    // Transition to results workspace
    setTimeout(() => {
      router.push("/analysis/demo");
    }, 800);
  };

  const handleLoadSamples = () => {
    setUploadedFiles([
      { id: "1", name: "P1001_axial_t1.png", size: "2.4 MB", modality: "T1", preview: MRI_SVGS.T1 },
      { id: "2", name: "P1001_axial_t2.png", size: "2.6 MB", modality: "T2", preview: MRI_SVGS.T2 },
      { id: "3", name: "P1001_axial_flair.png", size: "2.8 MB", modality: "FLAIR", preview: MRI_SVGS.FLAIR },
      { id: "4", name: "P1001_axial_t1ce.png", size: "3.1 MB", modality: "T1CE", preview: MRI_SVGS.T1CE },
    ]);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">New Multimodal MRI Analysis</h1>
            <p className="text-xs text-slate-400">Configure scans, select AI pipeline modules, and execute inference.</p>
          </div>
          <button
            onClick={handleLoadSamples}
            className="text-xs font-semibold text-cyan hover:underline flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load BraTS Sample Scans</span>
          </button>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          {[
            { step: 1, label: "1. Upload MRI" },
            { step: 2, label: "2. Configure Options" },
            { step: 3, label: "3. AI Processing" },
            { step: 4, label: "4. Results Workspace" },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                currentStep === s.step
                  ? "bg-primary/20 border-primary text-primary shadow-glow-blue"
                  : currentStep > s.step
                  ? "bg-navy-900 border-slate-700 text-emerald-400"
                  : "bg-navy-900/60 border-slate-800 text-slate-500"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: UPLOAD WORKFLOW */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Patient ID bar */}
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Patient / Study Identifier</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="P-1001"
                className="bg-navy-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan font-mono font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              De-identified patient study protocol. No PHI stored.
            </div>
          </div>

          {/* Drag & drop dropzone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-primary rounded-2xl p-8 text-center bg-navy-900/50 hover:bg-navy-900/80 transition-all cursor-pointer space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Drag & drop brain MRI scans here, or browse files</p>
              <p className="text-xs text-slate-400">Supported: PNG, JPG, NIfTI, and DICOM-ready architectures</p>
            </div>
            <div className="inline-flex gap-2 text-[10px] font-mono text-slate-400 pt-2">
              <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">T1</span>
              <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">T2</span>
              <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800">FLAIR</span>
              <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800 font-bold text-primary">T1-CE</span>
            </div>
          </div>

          {/* Uploaded Files Table */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Uploaded Modalities ({uploadedFiles.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-2 relative group">
                  <div className="w-full h-32 rounded bg-black/40 overflow-hidden relative">
                    <img src={file.preview} alt={file.name} className="w-full h-full object-contain" />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-navy-900/90 text-cyan text-[10px] font-mono font-bold">
                      {file.modality}
                    </span>
                  </div>
                  <div className="text-[11px] truncate font-medium text-slate-200">{file.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{file.size}</span>
                    <span className="text-emerald-400 font-semibold">Validated</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
              >
                <span>Proceed to Pipeline Configuration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURE PIPELINE OPTIONS */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Select AI Inference Tasks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enable or disable specific neural network heads for this multimodal evaluation session.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { key: "detectTumor", label: "Tumor Presence Detection", desc: "Binary presence gatekeeper" },
                { key: "classifyType", label: "Tumor Type Classification", desc: "Glioma, Meningioma, Pituitary, or No Tumor" },
                { key: "segmentRegion", label: "3D Boundary Segmentation", desc: "Voxel-level Attention U-Net contouring" },
                { key: "estimateGrade", label: "Histologic Grade Estimation", desc: "Low-Grade (II) vs High-Grade (III-IV)" },
                { key: "generateExplainability", label: "Explainable AI (Grad-CAM & SHAP)", desc: "Salience maps and feature attribution" },
                { key: "calculateVolume", label: "Quantitative Volumetry (cm³)", desc: "Calculates physical tumor volume" },
                { key: "comparePrevious", label: "Compare with Previous Scans", desc: "Calculates interval volume change" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  onClick={() => handleToggleOption(opt.key as keyof typeof options)}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${
                    options[opt.key as keyof typeof options]
                      ? "bg-primary/10 border-primary/40 text-white"
                      : "bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options[opt.key as keyof typeof options]}
                    onChange={() => {}}
                    className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back to Uploads
              </button>

              <button
                onClick={handleStartAnalysis}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run AI Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROCESSING PIPELINE ANIMATION */}
      {currentStep === 3 && (
        <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Executing Multimodal AI Pipeline</h2>
            <p className="text-xs text-slate-400 font-mono">
              Model: <span className="text-cyan">BrainTumorVision-EfficientNet-Attention-v1.3.0</span> • Device: <span className="text-primary">PyTorch / CPU</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-lg mx-auto">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Current Task: <strong className="text-white">{activeStage}</strong></span>
              <span className="text-cyan font-bold">{pipelineProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${pipelineProgress}%` }}
                className="h-full bg-gradient-to-r from-primary via-cyan to-purple-accent transition-all duration-300 shadow-glow-blue"
              />
            </div>
          </div>

          {/* Pipeline Stage Checklist */}
          <div className="max-w-lg mx-auto space-y-2 pt-4 border-t border-slate-800">
            {PIPELINE_STAGES.map((stg, idx) => {
              const isDone = completedStages.includes(stg);
              const isRunning = activeStage === stg;
              return (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <RefreshCw className="w-4 h-4 text-cyan animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                    <span className={isDone ? "text-slate-300" : isRunning ? "text-cyan font-bold" : "text-slate-500"}>
                      {stg}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {isDone ? "Done" : isRunning ? "Running..." : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
