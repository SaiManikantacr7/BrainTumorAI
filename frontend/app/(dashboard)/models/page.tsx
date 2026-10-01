"use client";

import React, { useState } from "react";
import { Cpu, Zap, Activity, Layers, CheckCircle2, Info, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

const MODELS = [
  {
    name: "BrainTumorVision EfficientNet-B4",
    short: "EffNet-B4",
    arch: "EfficientNet-B4 + Attention",
    acc: 96.2,
    f1: 96.1,
    dice: 92.4,
    latency: 385,
    params: 19.3,
    status: "Active Default",
    desc: "Dual spatial and channel attention modules. Superior feature selectivity and sub-centimeter edge localization.",
  },
  {
    name: "ConvNeXt-Tiny Late Fusion",
    short: "ConvNeXt-T",
    arch: "ConvNeXt-T Depthwise 7x7",
    acc: 95.4,
    f1: 95.3,
    dice: 90.8,
    latency: 420,
    params: 28.6,
    status: "Validated",
    desc: "Pure convolutional design with modern receptive field scaling. Stable under scanner noise.",
  },
  {
    name: "Vision Transformer (ViT-Base/16)",
    short: "ViT-Base",
    arch: "12-Layer Transformer Global Attention",
    acc: 94.8,
    f1: 94.6,
    dice: 89.6,
    latency: 610,
    params: 86.4,
    status: "Research",
    desc: "Global self-attention across 16x16 pixel patches. Generates highly interpretable attention rollout maps.",
  },
  {
    name: "ResNet-50 Baseline",
    short: "ResNet-50",
    arch: "Residual Bottleneck (No Attention)",
    acc: 92.8,
    f1: 92.5,
    dice: 87.5,
    latency: 340,
    params: 25.6,
    status: "Baseline",
    desc: "Classical residual architecture serving as standard baseline reference for ablation comparative analysis.",
  },
];

export default function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  const barData = MODELS.map((m) => ({
    name: m.short,
    Accuracy: m.acc,
    Dice: m.dice,
    Latency: m.latency,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Model Intelligence & Comparative Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Comparative benchmarks across convolutional, transformer, and multimodal attention architectures evaluated on BraTS 2023.
        </p>
      </div>

      {/* Models Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODELS.map((m, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedModel(m)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
              selectedModel.name === m.name
                ? "bg-navy-900 border-primary shadow-glow-blue"
                : "bg-navy-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                  {m.status}
                </span>
                <span className="text-xs font-mono text-slate-500">{m.params}M params</span>
              </div>
              <h3 className="text-sm font-bold text-white">{m.name}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{m.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">ACCURACY</span>
                <strong className="text-primary">{m.acc}%</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DICE (DSC)</span>
                <strong className="text-cyan">0.{m.dice.toString().replace('.', '')}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section: Comparative Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Cross-Model Accuracy & Dice Score Comparison</h3>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Accuracy %</span>
              </div>
              <div className="flex items-center gap-1 text-cyan">
                <span className="w-2 h-2 rounded-full bg-cyan" />
                <span>Dice %</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A0F1D", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="Accuracy" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dice" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Model Deep Dive */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan uppercase font-bold">Selected Architecture Profile</div>
            <h3 className="text-lg font-bold text-white">{selectedModel.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedModel.desc}</p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Latency (Forward Pass):</span>
              <strong className="text-white">{selectedModel.latency} ms</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Parameter Footprint:</span>
              <strong className="text-cyan">{selectedModel.params} Million</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Macro F1-Score:</span>
              <strong className="text-primary">{selectedModel.f1}%</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Calibration Status:</span>
              <strong className="text-emerald-400">Platt Calibrated</strong>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan inline mr-1" />
            No single architecture is clinically superior across all pathologies. Ensemble consensus is utilized in high-uncertainty scans.
          </div>
        </div>
      </div>
    </div>
  );
}
