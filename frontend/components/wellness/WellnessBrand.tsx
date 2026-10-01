export function WellnessLogo({ className = "h-11 w-11" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 64 64" className={className} fill="none">
    <defs><linearGradient id="wellness-logo-bg" x1="8" y1="5" x2="56" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="#0EA5E9"/><stop offset="1" stopColor="#4F46E5"/></linearGradient></defs>
    <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#wellness-logo-bg)"/>
    <path d="M17 29c0-10 6-17 15-17s15 7 15 17v8c0 7-6 13-15 13s-15-6-15-13v-8Z" fill="#F8FAFC" fillOpacity=".97"/>
    <path d="M32 15c-4-5-11-1-10 5-5 1-5 8 0 10-3 5 1 10 6 8m4-23c4-5 11-1 10 5 5 1 5 8 0 10 3 5-1 10-6 8m-4-23v20m-9-14c4 0 5 3 5 6m13-6c-4 0-5 3-5 6m-12 0c4 0 5 3 5 6m13-6c-4 0-5 3-5 6" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 39v3c0 5 5 9 11 9s11-4 11-9v-3m-22 0h5m12 0h5m-17 5h14m-10-1v4m6-4v4" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

export function WellnessBrand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <WellnessLogo className={compact ? "h-9 w-9 shrink-0" : "h-11 w-11 shrink-0"}/>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-sky-300">BrainTumorVision AI</p>
      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[.22em] text-slate-500">Personalized Wellness</p>
    </div>
  </div>;
}
