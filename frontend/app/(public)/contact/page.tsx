"use client";

import React, { useState } from "react";
import { Mail, Building2, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 px-6 md:px-12 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold">
          COLLABORATE & VALIDATE
        </div>
        <h1 className="text-3xl font-black text-white">Academic & Clinical Research Inquiries</h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          Interested in participating in multi-center validation, testing novel MRI sequences, or integrating your university radiology dataset? Get in touch with our research team.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 shadow-2xl">
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Inquiry Received</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Thank you for reaching out. A BrainTumorVision AI team member will review your proposal and respond within 2 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Principal Investigator / Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Katherine Morris, MD"
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="kmorris@radiology.edu"
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Institution or Clinical Center</label>
              <input
                type="text"
                required
                placeholder="Department of Diagnostic Neuroradiology, University Hospital"
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Research Focus / Proposed Cohort</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your research cohort, MRI scanner types (e.g. Siemens 3T, GE 1.5T), target pathology, or algorithmic evaluation goals..."
                className="w-full bg-navy-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow-blue transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Research Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
