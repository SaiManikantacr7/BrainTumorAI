"use client";

import React from "react";
import Link from "next/link";
import { Users, LineChart, ChevronRight, Search, Plus, Eye } from "lucide-react";
import { SAMPLE_PATIENTS } from "@/lib/demo-data";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <DisclaimerBanner variant="warning" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">Patient Surveillance Registry</h1>
          <p className="text-xs text-slate-400">De-identified clinical research cohorts under active longitudinal observation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by ID (e.g. P-1001)..."
              className="bg-navy-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_PATIENTS.map((patient) => (
          <div key={patient.id} className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-black font-mono text-primary group-hover:text-cyan transition-colors">
                  {patient.patient_id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {patient.scan_count} Scans
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-200">{patient.primary_condition}</div>
                <div className="text-[11px] text-slate-400">{patient.age} years • {patient.sex}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Latest Volume:</span>
                  <strong className="text-cyan">{patient.estimated_volume_cm3} cm³</strong>
                </div>
                <div className="flex justify-between">
                  <span>Last Evaluation:</span>
                  <span className="text-slate-300">{patient.latest_scan_date}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <Link
                href={`/patients/${patient.patient_id}`}
                className="text-xs text-slate-400 hover:text-white"
              >
                Profile
              </Link>

              <Link
                href={`/patients/${patient.patient_id}/timeline`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-all"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

