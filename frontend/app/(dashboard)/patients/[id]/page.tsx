"use client";

import React from "react";
import Link from "next/link";
import { User, LineChart, FileText, Activity, Layers, ChevronRight } from "lucide-react";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { SAMPLE_PATIENTS } from "@/lib/demo-data";

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = SAMPLE_PATIENTS.find((p) => p.patient_id === params.id) || SAMPLE_PATIENTS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <DisclaimerBanner variant="warning" />

      {/* Profile Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-xl font-bold">
              {patient.patient_id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{patient.name}</h1>
                <span className="px-2 py-0.5 rounded bg-cyan/10 text-cyan text-xs font-mono">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{patient.primary_condition}</p>
            </div>
          </div>

          <Link
            href={`/patients/${patient.patient_id}/timeline`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
          >
            <LineChart className="w-4 h-4" />
            <span>Longitudinal Timeline</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">AGE / SEX:</span>
            <strong className="text-slate-200">{patient.age} years • {patient.sex}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">TOTAL SCANS:</span>
            <strong className="text-primary">{patient.scan_count} Studies</strong>
          </div>
          <div>
            <span className="text-slate-500 block">LATEST VOLUME:</span>
            <strong className="text-cyan">{patient.estimated_volume_cm3} cm³</strong>
          </div>
          <div>
            <span className="text-slate-500 block">LAST STUDY:</span>
            <strong className="text-slate-200">{patient.latest_scan_date}</strong>
          </div>
        </div>
      </div>

      {/* Studies Archive Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Longitudinal Scan Repository</h3>
        <div className="space-y-3">
          {[
            { date: "Sep 10, 2026", id: "SCAN-2026-04", modality: "T1, T2, FLAIR, T1-CE", volume: "12.1 cm³", change: "+6.1%" },
            { date: "Jul 18, 2026", id: "SCAN-2026-03", modality: "T1, T2, FLAIR, T1-CE", volume: "11.4 cm³", change: "-19.7%" },
            { date: "Apr 22, 2026", id: "SCAN-2026-02", modality: "T1, T2, FLAIR, T1-CE", volume: "14.2 cm³", change: "-23.6%" },
            { date: "Jan 15, 2026", id: "SCAN-2026-01", modality: "T1, T2, FLAIR, T1-CE", volume: "18.6 cm³", change: "Baseline" },
          ].map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <span>{s.date}</span>
                  <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">
                    {s.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{s.modality}</div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">VOLUME</span>
                  <strong className="text-cyan">{s.volume}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DELTA</span>
                  <span className={s.change.startsWith("-") ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {s.change}
                  </span>
                </div>
                <Link
                  href="/analysis/demo"
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

