"use client";

import React, { useState } from "react";
import { Settings, Save, Server, Cpu, Database, Mail, Shield, CheckCircle2 } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:8000/api");
  const [modelVersion, setModelVersion] = useState("v1.3.0 (EfficientNet-B4 + Attention)");
  const [pacsHost, setPacsHost] = useState("dcm-pacs.hospital-network.local:104");
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">System Settings & Checkpoint Configurations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage backend endpoints, PACS gateways, and model inference runtime preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API & Backend Routing */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span>FastAPI Backend Gateway</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">REST API Base Endpoint</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <label className="flex items-center gap-2.5 pt-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <div>
                <strong className="text-white block">Enable Automatic Fallback Demo Mode</strong>
                <span className="text-[11px] text-slate-400">
                  When enabled, the frontend smoothly serves synthetic BraTS scans and simulated responses if the backend server is unreachable.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Model Checkpoint Settings */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan" />
            <span>Active Model Checkpoint Weights</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Production Checkpoint</label>
              <select
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono"
              >
                <option>v1.3.0 (EfficientNet-B4 + Attention) — Primary Active</option>
                <option>v1.2.1 (ConvNeXt-Tiny Multimodal Fusion)</option>
                <option>v1.1.0 (Vision Transformer ViT-Base/16)</option>
                <option>v2.0.0-rc (3D Attention U-Net Segmenter)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
              Weights Directory: <span className="text-slate-200">models/checkpoints/braintumorvision_effnet_v130.pt</span>
            </div>
          </div>
        </div>

        {/* DICOM PACS Gateway Architecture */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-accent" />
            <span>Hospital DICOM PACS Gateway (Architecture Ready)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">PACS AE Title / Host</label>
              <input
                type="text"
                value={pacsHost}
                onChange={(e) => setPacsHost(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              DICOM C-MOVE / C-STORE receiver service is configured for direct clinical server integration.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
