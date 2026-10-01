"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Brain,
  Layers,
  Clock,
  PlusCircle,
  LineChart as LineChartIcon,
  FlaskConical,
  ShieldCheck,
  FileText,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { SAMPLE_DASHBOARD_DATA, SAMPLE_PATIENTS } from "@/lib/demo-data";

export default function DashboardPage() {
  const { kpis, tumorDistribution, monthlyActivity } = SAMPLE_DASHBOARD_DATA;

  return (
    <div className="space-y-8">
      {/* Top Banner Notice */}
      <DisclaimerBanner variant="warning" />

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Clinical & Research Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal MRI ingestion, tumor classification overview, and model performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/analysis/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New MRI Analysis</span>
          </Link>
        </div>
      </div>

      {/* Top KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{kpi.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{kpi.value}</div>
            <div className="text-[11px] text-slate-500">{kpi.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "New Analysis", href: "/analysis/new", icon: PlusCircle, color: "text-primary bg-primary/10 border-primary/30" },
          { label: "Patient Timeline", href: "/patients/P-1001/timeline", icon: LineChartIcon, color: "text-purple-accent bg-purple-accent/10 border-purple-accent/30" },
          { label: "Research Lab", href: "/research-lab", icon: FlaskConical, color: "text-cyan bg-cyan/10 border-cyan/30" },
          { label: "Model Validation", href: "/validation", icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
          { label: "Clinical Reports", href: "/reports", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
        ].map((qa, i) => {
          const Icon = qa.icon;
          return (
            <Link
              key={i}
              href={qa.href}
              className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 hover:bg-navy-850 flex items-center gap-2.5 transition-all group text-xs font-medium text-slate-200"
            >
              <div className={`p-2 rounded-lg border ${qa.color} group-hover:scale-105 transition-transform flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{qa.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Charts Section: Activity Over Time & Tumor Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Scan Activity & Dice Overlap */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Scan Activity & Segmentation Dice</h3>
              <p className="text-[11px] text-slate-400">Scan throughput vs average volumetric boundary overlap</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Scans</span>
              </div>
              <div className="flex items-center gap-1 text-cyan">
                <span className="w-2 h-2 rounded-full bg-cyan" />
                <span>Dice Score</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#0EA5E9" stop-opacity={0.4} />
                    <stop offset="95%" stop-color="#0EA5E9" stop-opacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A0F1D", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="scans" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#scansGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Tumor Type Distribution */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Tumor Type Distribution</h3>
            <p className="text-[11px] text-slate-400">Class frequencies in current evaluation cohort</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tumorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {tumorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A0F1D", borderColor: "#1E293B", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
            {tumorDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
                <span className="text-slate-500 font-mono ml-auto">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patient Analyses Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Patient Evaluations</h3>
            <p className="text-[11px] text-slate-400">De-identified research subjects under active surveillance</p>
          </div>
          <Link href="/patients" className="text-xs text-primary hover:underline flex items-center gap-1">
            <span>View All Patients</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="pb-3 font-semibold">PATIENT ID</th>
                <th className="pb-3 font-semibold">AGE / SEX</th>
                <th className="pb-3 font-semibold">RESEARCH DIAGNOSIS</th>
                <th className="pb-3 font-semibold">EST. VOLUME</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SAMPLE_PATIENTS.map((p) => (
                <tr key={p.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 font-mono font-bold text-primary">{p.patient_id}</td>
                  <td className="py-3 text-slate-300">{p.age}y • {p.sex}</td>
                  <td className="py-3 text-slate-200">{p.primary_condition}</td>
                  <td className="py-3 font-mono text-cyan font-bold">{p.estimated_volume_cm3} cm³</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/patients/${p.patient_id}/timeline`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan hover:underline"
                    >
                      <span>Timeline</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

