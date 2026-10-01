"use client";

import React from "react";
import Link from "next/link";
import {
  LineChart as LineChartIcon,
  Calendar,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { SAMPLE_TIMELINE } from "@/lib/demo-data";

export default function LongitudinalTimelinePage({ params }: { params: { id: string } }) {
  const patientId = params.id || "P-1001";

  // Recharts formatted volume trend data
  const chartData = SAMPLE_TIMELINE.map((item) => ({
    date: item.label,
    fullDate: item.date,
    volume: item.tumor_volume_cm3,
    confidence: Math.round(item.confidence * 100),
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan">
            <span>LONGITUDINAL SURVEILLANCE SERIES</span>
            <span>•</span>
            <span className="text-slate-400">PATIENT ID: {patientId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Tumor Volumetric Progression Timeline</h1>
        </div>

        <Link
          href="/reports"
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
        >
          Export Timeline Report
        </Link>
      </div>

      {/* Clinical Terminology Callout (Section 15 Safety) */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Terminology Standard: Model-Observed Change</div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            In accordance with medical safety governance, volumetric variations across sequential scans are designated as <strong>&ldquo;Model-Observed Change&rdquo;</strong> rather than definitive clinical progression until verified by board-certified radiological review.
          </p>
        </div>
      </div>

      {/* 1. INTERACTIVE VOLUME VS TIME GRAPH */}
      <div className="p-6 md:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Tumor Volume Trajectory Over Time</h3>
            <p className="text-xs text-slate-400">Quantitative 3D segmented volume ($cm^3$) across sequential follow-up scans</p>
          </div>
          <div className="text-xs font-mono text-cyan bg-cyan/10 border border-cyan/30 px-3 py-1 rounded-full font-bold">
            Baseline: 18.6 cm³ → Latest: 12.1 cm³ (-34.9% overall)
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#06B6D4" stop-opacity={0.4} />
                  <stop offset="95%" stop-color="#06B6D4" stop-opacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} fontStyle="bold" />
              <YAxis stroke="#64748B" fontSize={11} domain={[8, 22]} unit=" cm³" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0A0F1D", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                name="Segmented Volume"
                stroke="#06B6D4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#volumeGrad)"
                dot={{ r: 5, fill: "#06B6D4", strokeWidth: 2, stroke: "#FFFFFF" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. CHRONOLOGICAL SCAN CARDS (JAN -> APR -> JUL -> SEP) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Sequential MRI Studies & Model-Observed Changes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_TIMELINE.map((scan, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan/40 transition-all group"
            >
              <div className="space-y-2.5">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                    {scan.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{scan.date}</span>
                </div>

                {/* MRI Thumbnail */}
                <div className="w-full h-40 rounded-xl bg-black overflow-hidden relative border border-slate-800">
                  <img
                    src={scan.thumbnail}
                    alt={`${scan.label} MRI`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-navy-950/90 text-cyan text-[10px] font-mono font-bold">
                    {scan.tumor_volume_cm3} cm³
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">{scan.model_prediction}</div>
                  <div className="text-[11px] text-slate-400">Confidence: <strong className="text-primary font-mono">{Math.round(scan.confidence * 100)}%</strong></div>
                </div>

                {/* Model Observed Change */}
                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-300 leading-snug">
                  <span className="text-cyan font-bold block mb-0.5">Model-observed change:</span>
                  {scan.model_observed_change}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">{scan.scan_id}</span>
                <Link
                  href="/analysis/demo"
                  className="text-cyan hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  <span>Open Scan</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

