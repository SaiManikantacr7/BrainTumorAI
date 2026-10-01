"use client";

import React, { useState } from "react";
import { FlaskConical, Play, RefreshCw, CheckCircle2, Sliders, Layers, Cpu, Sparkles } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { apiClient } from "@/lib/api-client";

export default function ResearchLabPage() {
  const [model, setModel] = useState("EfficientNet-B4");
  const [dataset, setDataset] = useState("BraTS 2023");
  const [task, setTask] = useState("Multi-task (Classification + Segmentation)");
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [attention, setAttention] = useState(true);
  const [fusion, setFusion] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [experiments, setExperiments] = useState<any[]>([
    {
      id: "exp-1",
      name: "EXP-2026-A1: Multimodal Cross-Attention BraTS23",
      model: "EfficientNet-B4 + Attention",
      dataset: "BraTS 2023",
      accuracy: "96.2%",
      dice: "0.924",
      f1: "0.960",
      status: "COMPLETED",
    },
    {
      id: "exp-2",
      name: "EXP-2026-A2: ConvNeXt Late Fusion",
      model: "ConvNeXt-Tiny",
      dataset: "BraTS 2023",
      accuracy: "94.8%",
      dice: "0.902",
      f1: "0.945",
      status: "COMPLETED",
    },
  ]);

  const [ablationData] = useState([
    { variant: "1. Baseline CNN (ResNet-50 Single Modality T1-CE)", attention: false, fusion: false, acc: "88.4%", dice: "0.812", delta: "Reference" },
    { variant: "2. CNN + Squeeze-and-Excitation Attention", attention: true, fusion: false, acc: "91.6%", dice: "0.856", delta: "+3.2%" },
    { variant: "3. CNN + Multimodal Feature Fusion (T1+T2+FLAIR+T1CE)", attention: false, fusion: true, acc: "93.8%", dice: "0.891", delta: "+5.4%" },
    { variant: "4. CNN + Attention + Multimodal Fusion", attention: true, fusion: true, acc: "95.2%", dice: "0.914", delta: "+6.8%" },
    { variant: "5. Full BrainTumorVision Pipeline (Cross-Attention + Attention U-Net)", attention: true, fusion: true, acc: "96.5%", dice: "0.928", delta: "+8.1%" },
  ]);

  const handleRunExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);

    try {
      const expName = `EXP-${Date.now().toString().slice(-4)}: ${model} on ${dataset}`;
      const res = await apiClient.runExperiment({
        name: expName,
        model_architecture: model,
        dataset,
        task,
        epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
        multimodal_fusion: fusion,
        attention_module: attention,
      });

      setExperiments((prev) => [
        {
          id: res.id,
          name: res.name,
          model: res.model_architecture,
          dataset: res.dataset,
          accuracy: `${(res.accuracy * 100).toFixed(1)}%`,
          dice: res.dice.toFixed(3),
          f1: `${(res.f1 * 100).toFixed(1)}%`,
          status: "COMPLETED",
        },
        ...prev,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Research Lab & Experiment Dispatcher</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure deep neural architectures, run automated ablation evaluations, and trace multi-task training runs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Experiment Builder Form (Section 19) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <span>Experiment Configuration</span>
            </h3>
            <p className="text-xs text-slate-400">Parameterize neural model and training hyperparameters.</p>
          </div>

          <form onSubmit={handleRunExperiment} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Model Architecture</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option>EfficientNet-B4</option>
                <option>ConvNeXt-Tiny</option>
                <option>Vision Transformer (ViT-Base/16)</option>
                <option>ResNet-50 Baseline</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Target Dataset</label>
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option>BraTS 2023</option>
                <option>TCIA Glioblastoma Cohort</option>
                <option>Multi-Center Consortium Split</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Task Objective</label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option>Multi-task (Classification + Segmentation)</option>
                <option>Classification Only</option>
                <option>Segmentation Only</option>
                <option>Grade Estimation</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-slate-400">EPOCHS</label>
                <input
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-slate-400">BATCH SIZE</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-slate-400">LEARNING RATE</label>
                <input
                  type="number"
                  step="0.0001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fusion}
                  onChange={(e) => setFusion(e.target.checked)}
                  className="accent-primary"
                />
                <span>Enable Multimodal Cross-Attention Fusion</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attention}
                  onChange={(e) => setAttention(e.target.checked)}
                  className="accent-primary"
                />
                <span>Enable Channel & Spatial Attention Module</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunning ? "Dispatching Run..." : "Run Experiment"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: Ablation Studies Table (Section 20) & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ablation Studies Card */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan" />
                <span>Component-Wise Ablation Study</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantifying relative contribution of each architectural innovation against the baseline.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 font-mono text-[10px] text-slate-500">
                  <tr>
                    <th className="pb-2">ARCHITECTURE VARIANT</th>
                    <th className="pb-2">ACCURACY</th>
                    <th className="pb-2">DICE</th>
                    <th className="pb-2 text-right">GAIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ablationData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-navy-850/50">
                      <td className="py-2.5 text-slate-300 font-sans text-xs">{row.variant}</td>
                      <td className="py-2.5 text-primary">{row.acc}</td>
                      <td className="py-2.5 text-cyan">{row.dice}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">{row.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Experiment Runs History */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Recent Experiment Runs</h3>
            <div className="space-y-2">
              {experiments.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">{exp.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{exp.model} • {exp.dataset}</div>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <div><span className="text-slate-500">Acc: </span><strong className="text-primary">{exp.accuracy}</strong></div>
                    <div><span className="text-slate-500">Dice: </span><strong className="text-cyan">{exp.dice}</strong></div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">Done</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
