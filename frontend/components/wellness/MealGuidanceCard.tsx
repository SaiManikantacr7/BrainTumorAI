import { FileText } from "lucide-react";

const images: Record<string, string> = {
  Breakfast: "https://images.unsplash.com/photo-1680359873197-c3eb21ec05c0?auto=format&fit=crop&w=900&q=82",
  "Mid-morning": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=82",
  Lunch: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=82",
  "Afternoon snack": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82",
  "Evening snack": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82",
  Dinner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
};

export function MealGuidanceCard({ meal, token, onNotify }: { meal: any; token: string | null; onNotify: (message: string) => void }) {
  const image = images[meal.meal] || images.Lunch;
  return <article className="wellness-meal-card group overflow-hidden rounded-2xl border border-slate-800 bg-[#080e19] transition duration-300 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-xl hover:shadow-sky-950/20">
    <div className="relative h-40 overflow-hidden bg-slate-900 sm:h-48">
      <img src={image} loading="lazy" referrerPolicy="no-referrer" alt={`${meal.meal} meal inspiration photo; illustrative only, not a verified USDA product image`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />
      <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/60 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-white/90">Internet-hosted · Illustrative</span>
      <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-slate-950/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">{meal.meal}</span>
    </div>
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-sky-300">USDA FoodData Central</p><h3 className="mt-1.5 text-base font-semibold leading-snug text-slate-100">{meal.available ? meal.food : "Nutrition data unavailable"}</h3></div>{meal.fdc_id && <button type="button" aria-label={`Open USDA details for ${meal.food}`} onClick={async () => { try { const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/wellness/foods/${meal.fdc_id}`, { headers: { Authorization: `Bearer ${token || ""}` } }); if (!response.ok) throw new Error(); const detail = await response.json(); onNotify(`${detail.description} · USDA details retrieved.`); } catch { onNotify("Nutrition database temporarily unavailable."); } }} className="shrink-0 rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-sky-400 hover:text-sky-200"><FileText className="h-4 w-4"/></button>}</div>
      {meal.available ? <><p className="mt-2 text-xs leading-relaxed text-slate-400">{meal.portion_guidance}</p><div className="mt-3 flex flex-wrap gap-1.5">{Object.entries(meal.nutrition || {}).map(([key, value]: any) => <span key={key} className="rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[10px] text-slate-300">{key.replaceAll("_g", "").replace("_mg", "")}: {value.value} {value.unit}</span>)}</div><p className="mt-3 text-[11px] leading-relaxed text-slate-400">{meal.reason}</p></> : <p className="mt-2 text-xs leading-relaxed text-slate-400">{meal.message || "Nutrition database temporarily unavailable or no compatible record returned."}</p>}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3"><span className="text-[10px] text-slate-500">{meal.available ? "Food record verified by USDA" : "No food record returned"}</span><span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">Photo is not food data</span></div>
    </div>
  </article>;
}
