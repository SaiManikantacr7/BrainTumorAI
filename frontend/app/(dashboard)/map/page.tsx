import React, { FormEvent, useState } from "react";
import { Activity, AlertCircle, ArrowDownUp, CalendarDays, ChevronDown, CircleHelp, Database, Filter, Layers2, MapPin, Minus, Plus, RotateCcw, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Props = { admin?: boolean };
type GeoResponse = {
  locations: Array<Record<string, unknown>>;
  summary: { total_records: number; location_count: number; tumor_types: unknown[]; grades: unknown[]; datasets: unknown[]; model_versions: unknown[] };
  metadata: { available: boolean; message?: string; data_source?: string };
  data_quality?: { records_with_geographic_metadata: number; records_without_geographic_metadata: number | null; suppressed_locations: number };
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const inputStyle = "mt-1.5 w-full rounded-lg border border-slate-700/80 bg-[#0a1220] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50";

export default function GeographicMapPage({ admin = false }: Props) {
  const { token } = useAuth();
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [response, setResponse] = useState<GeoResponse | null>(null);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("total");
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [zoom, setZoom] = useState(5);

  async function applyFilters(event?: FormEvent) {
    event?.preventDefault();
    setApplied(true); setLoading(true); setError(""); setUnauthorized(false);
    const params = new URLSearchParams();
    if (location.trim()) params.set("city", location.trim());
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    try {
      const endpoint = admin ? "/admin/map" : "/analytics/geographic";
      const res = await fetch(`${API_BASE}${endpoint}${admin || !params.size ? "" : `?${params}`}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { setUnauthorized(true); setResponse(null); }
      else if (!res.ok) throw new Error("Request failed");
      else setResponse(await res.json());
    } catch { setError("Unable to load geographic analytics. Please try again."); setResponse(null); }
    finally { setLoading(false); }
  }

  function reset() { setLocation(""); setStartDate(""); setEndDate(""); setSearch(""); setSort("total"); setApplied(false); setResponse(null); setError(""); setUnauthorized(false); }
  const rows = (response?.locations || []).filter((row) => String(row.city || row.district || row.state || "").toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6 pb-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-sky-300"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" />Research intelligence <span className="text-slate-600">/</span> Geographic map</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Brain Tumor Geographic Intelligence</h1>
        <p className="mt-2 text-sm text-slate-400">Explore privacy-preserving aggregated analysis records by location.</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[.07] px-3 py-2 text-xs text-sky-200"><Activity className="h-3.5 w-3.5" />Research / Decision-Support Analytics</div>
    </div>

    <div className="flex gap-3 rounded-xl border border-sky-400/15 bg-sky-400/[.045] p-4 text-sm leading-relaxed text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /><p>This map displays aggregated analysis records based on authorized metadata. It does not represent population prevalence or provide a medical diagnosis.</p></div>

    <div className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[260px_minmax(440px,1fr)_280px] xl:grid-cols-[250px_minmax(360px,1fr)]">
      <form onSubmit={applyFilters} className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 shadow-xl shadow-black/10">
        <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><SlidersHorizontal className="h-4 w-4 text-sky-300" />Filter map data</div><button type="button" onClick={reset} className="text-xs text-slate-500 hover:text-sky-300">Reset</button></div>
        <div className="mb-4 rounded-lg border border-slate-800 bg-[#080e19] p-3 text-xs leading-relaxed text-slate-400">Filter values are enabled when a validated geographic dataset is connected. No such dataset is currently configured.</div>
        <fieldset disabled className="space-y-4 opacity-60">
          <div><label className="text-xs font-medium text-slate-300">Tumor grade</label><div className="mt-2 grid grid-cols-2 gap-y-2">{[1,2,3,4].map((n)=><label key={n} className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" className="accent-sky-500" />Grade {n}</label>)}</div></div>
          <div><label htmlFor="type" className="text-xs font-medium text-slate-300">Tumor type</label><select id="type" className={inputStyle}><option>Dataset classes unavailable</option></select></div>
          <div><label className="text-xs font-medium text-slate-300">Geographic filters</label><select className={inputStyle} aria-label="Country"><option>Country</option></select><select className={inputStyle} aria-label="State"><option>State / region</option></select><input className={inputStyle} value={location} onChange={e=>setLocation(e.target.value)} placeholder="District or city" /></div>
          <div><label className="text-xs font-medium text-slate-300">Date range</label><div className="relative"><CalendarDays className="absolute left-3 top-4 h-3.5 w-3.5 text-slate-500"/><input aria-label="Start date" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className={`${inputStyle} pl-9`} /></div><div className="relative"><CalendarDays className="absolute left-3 top-4 h-3.5 w-3.5 text-slate-500"/><input aria-label="End date" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className={`${inputStyle} pl-9`} /></div></div>
          <div><label className="text-xs font-medium text-slate-300">Dataset</label><select className={inputStyle}><option>Dataset unavailable</option></select></div>
          <div><label className="text-xs font-medium text-slate-300">Model version</label><select className={inputStyle}><option>Model version unavailable</option></select></div>
        </fieldset>
        <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"><Filter className="h-4 w-4" />Apply filters</button>
        <button type="button" onClick={reset} className="mt-2 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">Reset filters</button>
      </form>

      <div className="min-w-0 space-y-4">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-100">Geographic distribution</h2><p className="mt-0.5 text-[11px] text-slate-500">India · Regional context</p></div><div className="flex gap-1 rounded-lg border border-slate-800 bg-[#080e19] p-1"><button aria-label="Map view" className="rounded-md bg-sky-500/15 px-2.5 py-1.5 text-xs text-sky-300"><MapPin className="inline h-3.5 w-3.5" /> Map</button><button aria-label="Satellite view unavailable" disabled className="rounded-md px-2.5 py-1.5 text-xs text-slate-600">Satellite</button><button aria-label="Reset map view" onClick={()=>setZoom(5)} className="rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /></button></div></div>
          <div className="relative h-[390px] bg-[#0a1420] sm:h-[480px]">
            <iframe title="Map of India and South Asia" className="h-full w-full border-0 opacity-[.85] grayscale-[.25]" src={`https://www.openstreetmap.org/export/embed.html?bbox=67.5%2C5.5%2C93.5%2C36.5&layer=mapnik&zoom=${zoom}`} loading="lazy" referrerPolicy="no-referrer" />
            <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-[#0b1220]/95 shadow-lg"><button aria-label="Zoom in" onClick={()=>setZoom(Math.min(10,zoom+1))} className="p-2 text-slate-300 hover:bg-slate-800"><Plus className="h-4 w-4" /></button><div className="h-px bg-slate-700"/><button aria-label="Zoom out" onClick={()=>setZoom(Math.max(3,zoom-1))} className="p-2 text-slate-300 hover:bg-slate-800"><Minus className="h-4 w-4" /></button></div>
            {!applied && <div className="absolute inset-0 flex items-center justify-center bg-[#07101c]/[.44] p-4"><div className="max-w-sm rounded-2xl border border-slate-600/80 bg-[#0b1422]/95 p-6 text-center shadow-2xl backdrop-blur"><div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full border border-sky-400/20 bg-sky-400/10"><Layers2 className="h-5 w-5 text-sky-300" /></div><p className="text-sm font-semibold text-white">No filters applied</p><p className="mt-1.5 text-xs leading-relaxed text-slate-400">Apply filters to view aggregated research records. No markers are displayed until an authorized query is applied.</p></div></div>}
            {applied && !loading && !error && !unauthorized && <div className="absolute inset-0 flex items-center justify-center bg-[#07101c]/[.30] p-4"><div className="max-w-sm rounded-2xl border border-slate-700 bg-[#0b1422]/95 px-6 py-5 text-center backdrop-blur"><p className="text-sm font-medium text-slate-200">{response?.locations?.length ? "Aggregated records loaded" : "No geographic analysis records match the selected filters."}</p><p className="mt-1 text-xs text-slate-500">{response?.metadata?.message || "No authorized location records are available."}</p></div></div>}
            {loading && <div className="absolute inset-0 grid place-items-center bg-[#07101c]/60"><p className="rounded-lg border border-slate-700 bg-[#0b1422] px-4 py-3 text-sm text-slate-300">Loading aggregated research data...</p></div>}
            {error && <div role="alert" className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-lg border border-rose-400/30 bg-[#190e18] p-3 text-sm text-rose-200"><AlertCircle className="h-4 w-4"/>{error}<button onClick={()=>applyFilters()} className="ml-auto underline">Retry</button></div>}
            {unauthorized && <div role="alert" className="absolute inset-4 grid place-items-center rounded-xl bg-[#0b1422]/95 p-5 text-center text-sm text-amber-200">You are not authorized to access this analytics view.</div>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5 text-[10px] text-slate-500"><span>Map © OpenStreetMap contributors</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>City and district aggregation only</span></div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-100">Top locations</h2><p className="mt-1 text-xs text-slate-500">Highest number of aggregated analysis records</p></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500"/><input aria-label="Search locations" value={search} onChange={e=>setSearch(e.target.value)} className="w-36 rounded-md border border-slate-700 bg-[#080e19] py-2 pl-8 pr-2 text-xs outline-none focus:border-sky-400" placeholder="Search locations"/></div><button title="Sort locations" onClick={()=>setSort(sort === "total" ? "location" : "total")} className="rounded-md border border-slate-700 p-2 text-slate-400 hover:text-white"><ArrowDownUp className="h-3.5 w-3.5"/></button></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-y border-slate-800 text-slate-500"><th className="py-2.5 font-medium">Location</th><th className="py-2.5 font-medium">Total</th><th className="py-2.5 font-medium">G1</th><th className="py-2.5 font-medium">G2</th><th className="py-2.5 font-medium">G3</th><th className="py-2.5 font-medium">G4</th></tr></thead><tbody>{rows.length ? rows.map((r,i)=><tr key={i} className="border-b border-slate-800/70 text-slate-300"><td className="py-3">{[r.city,r.district,r.state].filter(Boolean).join(", ")}</td><td>{String(r.total ?? "—")}</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>) : <tr><td colSpan={6} className="py-8 text-center text-slate-500">{applied && !loading ? "No geographic analysis records match the selected filters." : "Apply filters to load locations."}</td></tr>}</tbody></table></div>
        </section>
      </div>

      <aside className="space-y-4 xl:col-span-2 2xl:col-span-1">
        <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-100">Overview</h2><span className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-500">{applied ? "Filtered" : "Awaiting filters"}</span></div><div className="grid grid-cols-2 gap-3 2xl:grid-cols-1">{[["Total analyzed records",response?.summary?.total_records], ["Locations",response?.summary?.location_count], ["Most common tumor type",null], ["Most common grade",null]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-slate-800 bg-[#080e19] p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold text-slate-100">{applied ? (value ?? "No data available") : "—"}</p></div>)}</div></section>
        <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Grade distribution</h2><div className="mt-4 grid h-28 place-items-center rounded-xl border border-dashed border-slate-800 bg-[#080e19] px-4 text-center text-xs text-slate-500">{applied ? "Grade information unavailable for this dataset." : "Apply filters to view dataset distribution."}</div></section>
        <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Tumor type distribution</h2><div className="mt-4 grid h-24 place-items-center rounded-xl border border-dashed border-slate-800 bg-[#080e19] px-4 text-center text-xs text-slate-500">{applied ? "No data available" : "Apply filters to view dataset distribution."}</div></section>
        {admin && <>
          <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Dataset distribution</h2><div className="mt-3 grid h-16 place-items-center rounded-xl border border-dashed border-slate-800 bg-[#080e19] px-4 text-center text-xs text-slate-500">{applied ? "No dataset metadata available." : "Apply filters to view dataset distribution."}</div></section>
          <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Model version distribution</h2><div className="mt-3 grid h-16 place-items-center rounded-xl border border-dashed border-slate-800 bg-[#080e19] px-4 text-center text-xs text-slate-500">{applied ? "No model version metadata available." : "Apply filters to view model distribution."}</div></section>
          <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Monthly trends</h2><div className="mt-3 grid h-16 place-items-center rounded-xl border border-dashed border-slate-800 bg-[#080e19] px-4 text-center text-xs text-slate-500">{applied ? "No date-series data available." : "Apply filters to view monthly trends."}</div></section>
        </>}
        {admin && <section className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4"><h2 className="text-sm font-semibold text-slate-100">Data quality</h2><dl className="mt-3 space-y-2 text-xs text-slate-400"><div className="flex justify-between"><dt>Records with geographic metadata</dt><dd>{response?.data_quality?.records_with_geographic_metadata ?? "—"}</dd></div><div className="flex justify-between"><dt>Records without geographic metadata</dt><dd>{response?.data_quality?.records_without_geographic_metadata ?? "—"}</dd></div><div className="flex justify-between"><dt>Suppressed locations</dt><dd>{response?.data_quality?.suppressed_locations ?? "—"}</dd></div></dl></section>}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]"><button onClick={()=>setProvenanceOpen(!provenanceOpen)} className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-slate-200"><span className="flex items-center gap-2"><Database className="h-4 w-4 text-sky-300"/>Data provenance</span><ChevronDown className={`h-4 w-4 transition ${provenanceOpen ? "rotate-180" : ""}`}/></button>{provenanceOpen && <div className="border-t border-slate-800 p-4 text-xs leading-relaxed text-slate-400">Source: {response?.metadata?.data_source || "Authorized patient metadata"}. Geographic metadata is not currently configured. No locations are inferred from MRI images, filenames, anatomical predictions, or institution names.</div>}</section>
      </aside>
    </div>

    <div className="flex gap-2 rounded-xl border border-slate-800 bg-[#090f1b] p-4 text-xs leading-relaxed text-slate-400"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"/><p>BrainTumorVision AI is a research and educational clinical decision-support prototype. Geographic analytics represent aggregated analysis records and should not be interpreted as population prevalence or a medical diagnosis. Locations with fewer than five records must be suppressed before display.</p></div>
  </div>;
}
