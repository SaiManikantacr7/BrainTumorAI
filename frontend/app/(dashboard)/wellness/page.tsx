import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Database, Download, FileText, HeartPulse, Leaf, MapPin, Moon, RefreshCw, ShieldCheck, Sparkles, Sun, Trash2, Utensils, Watch, Wind, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { WorkoutTimer } from "@/components/wellness/WorkoutTimer";
import { WellnessBrand } from "@/components/wellness/WellnessBrand";
import { MealGuidanceCard } from "@/components/wellness/MealGuidanceCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const steps = ["Personal profile", "Body metrics", "Lifestyle", "Family history", "Work & activity", "Environment", "Goals & preferences", "Review & generate"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const reminderOptions: Array<["workout" | "hydration" | "movement_break", string]> = [["workout", "Workout reminders"], ["hydration", "Hydration reminders"], ["movement_break", "Movement breaks"]];
const dietChoices = ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian", "Other"];
const allergyChoices = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Soy", "Wheat", "Gluten", "Fish", "Shellfish", "Sesame"];
const initialProfile: Record<string, any> = {
  consent_personalization: false, age: "", gender: "", preferred_language: "English", diet_preference: "Vegetarian", food_preference: "South Indian",
  allergies: [], custom_allergies: "", height_cm: "", weight_kg: "", height_value: "", height_unit: "cm", height_inches: "", weight_value: "", weight_unit: "kg",
  sleep_hours: "", sleep_schedule: "", sitting_hours: "", screen_time_hours: "", water_intake_liters: "", smoking: "", alcohol_frequency: "", caffeine_frequency: "", meals_per_day: "", fruit_vegetable_frequency: "", processed_food_frequency: "", sugary_drink_frequency: "", activity_types: [], exercise_sessions_per_week: "", average_session_minutes: "",
  family_history_consent: false, family_history: "Prefer not to say", family_relationships: [], profession: "Other", sitting_hours_work: "", standing_hours: "", walking_hours: "", physical_workload: "Low", mental_workload: "Moderate",
  country: "", state: "", district: "", city: "", goal: "Build consistency", experience: "Beginner", equipment: ["No equipment"], session_minutes: 30, workout_days: [], pain_or_injury: false, physical_limitations: false, water_reminder: true, movement_reminder: true,
};
const fieldClass = "wellness-input mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080e19] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20";
const cardClass = "wellness-card rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-xl shadow-black/10";

type Plan = {
  plan_id: string; generated_at: string; profile_summary: Record<string, any>; activity_profile: string;
  wellness_indicators: Array<{ name: string; status: string; rule: string }>;
  diet_guidance: Array<Record<string, any>>; weekly_schedule: Array<any>; exercise_plan: Record<string, any>;
  environment_guidance: Record<string, any>; water_quality: Record<string, any>; safety_notes: string[]; personalization_rules: string[];
};

async function apiRequest(path: string, token: string, method = "GET", body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function localDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function clockTime(date: Date) { return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }); }
function numberOrNull(value: unknown) { return value === "" || value === undefined || value === null ? null : Number(value); }

export default function WellnessPage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Record<string, any>>(initialProfile);
  const [step, setStep] = useState(0);
  const [clock, setClock] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [air, setAir] = useState<Record<string, any> | null>(null);
  const [airLoading, setAirLoading] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [temporaryCoordinates, setTemporaryCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState<string[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState({ workout: false, hydration: false, movement_break: false });
  const [lightMode, setLightMode] = useState(() => localStorage.getItem("wellness-theme") === "light");

  const toast = useCallback((message: string) => {
    setNotice(message); window.setTimeout(() => setNotice(""), 5000);
  }, []);

  const downloadPlan = async (format: "pdf" | "docx" | "txt") => {
    if (!token || !plan?.plan_id) return;
    try {
      const response = await fetch(`${API}/wellness/plan/${encodeURIComponent(plan.plan_id)}/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || "Plan export is unavailable.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `BrainTumorVision-Wellness-Plan.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast(`${format.toUpperCase()} plan downloaded.`);
    } catch (err: any) { setError(err.message || "Plan export is unavailable."); }
  };

  useEffect(() => {
    const ticker = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => { localStorage.setItem("wellness-theme", lightMode ? "light" : "dark"); }, [lightMode]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let active = true;
    Promise.allSettled([
      apiRequest("/wellness/profile", token), apiRequest("/wellness/plan", token), apiRequest("/wellness/notifications/preferences", token),
    ]).then(([profileResult, planResult, prefsResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled" && profileResult.value?.profile) {
        const stored = profileResult.value.profile;
        setProfile((previous) => ({ ...previous, ...stored, height_value: stored.height_cm ?? "", weight_value: stored.weight_kg ?? "" }));
      }
      if (planResult.status === "fulfilled" && planResult.value?.plan_id) setPlan(planResult.value);
      if (prefsResult.status === "fulfilled" && prefsResult.value?.preferences) setNotificationPrefs((old) => ({ ...old, ...prefsResult.value.preferences }));
      if ([profileResult, planResult, prefsResult].every((x) => x.status === "rejected")) setError("Wellness storage is currently unavailable. Check that the backend and MongoDB are running.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  const update = (key: string, value: any) => setProfile((current) => ({ ...current, [key]: value }));
  const toggleList = (key: string, item: string) => setProfile((current) => {
    const values: string[] = current[key] || [];
    return { ...current, [key]: values.includes(item) ? values.filter((value) => value !== item) : [...values, item] };
  });

  const payload = useCallback(() => {
    const heightCm = profile.height_unit === "ft/in"
      ? ((Number(profile.height_value) || 0) * 12 + (Number(profile.height_inches) || 0)) * 2.54
      : Number(profile.height_value) || Number(profile.height_cm) || 0;
    const weightKg = profile.weight_unit === "lb"
      ? (Number(profile.weight_value) || 0) * 0.45359237
      : Number(profile.weight_value) || Number(profile.weight_kg) || 0;
    const result: Record<string, any> = { ...profile, age: Number(profile.age), height_cm: Number(heightCm.toFixed(2)), weight_kg: Number(weightKg.toFixed(2)) };
    delete result.height_value; delete result.height_unit; delete result.height_inches; delete result.weight_value; delete result.weight_unit;
    for (const key of ["sleep_hours", "sitting_hours", "screen_time_hours", "water_intake_liters", "meals_per_day", "exercise_sessions_per_week", "average_session_minutes", "sitting_hours_work", "standing_hours", "walking_hours"]) {
      result[key] = numberOrNull(result[key]);
    }
    if (!result.family_history_consent) { delete result.family_history; result.family_relationships = []; }
    return result;
  }, [profile]);

  const validateStep = (target: number) => {
    if (target === 0 && (!profile.age || Number(profile.age) < 18 || !profile.diet_preference || !profile.food_preference)) return "Enter an age of 18 or older and choose diet and food preferences.";
    if (target === 1 && (!(Number(profile.height_value || profile.height_cm) > 0) || !(Number(profile.weight_value || profile.weight_kg) > 0))) return "Enter your height and weight to calculate the body-size measure.";
    if (target === 2 && (profile.sleep_hours === "" || profile.sitting_hours === "" || profile.screen_time_hours === "" || profile.water_intake_liters === "" || profile.meals_per_day === "" || Number(profile.meals_per_day) < 1 || Number(profile.meals_per_day) > 6)) return "Complete the daily routine fields and select 1 to 6 meals per day.";
    if (target === 3 && !profile.family_history) return "Choose an answer for the family-history question.";
    if (target === 4 && (!profile.profession || !profile.physical_workload || !profile.mental_workload)) return "Complete the work and workload fields.";
    if (target === 6 && !(profile.workout_days || []).length) return "Choose at least one preferred activity day, or add a day before generating a weekly plan.";
    if (target === 6 && !profile.consent_personalization) return "Please review and accept the wellness-data consent before saving or generating a plan.";
    return "";
  };
  const validateAll = () => {
    for (let index = 0; index <= 6; index += 1) { const message = validateStep(index); if (message) { setStep(index); return message; } }
    return "";
  };
  const advance = () => {
    const message = validateStep(step);
    if (message) { setError(message); return; }
    setError(""); setStep(Math.min(7, step + 1));
  };

  const saveDraft = async () => {
    if (!token) return;
    const validation = validateAll();
    if (validation) { setError(validation); return; }
    setBusy(true); setError("");
    try { await apiRequest("/wellness/profile", token, "PUT", payload()); toast("Your wellness draft is saved to your private profile."); }
    catch (err: any) { setError(err.message || "Could not save this draft."); }
    finally { setBusy(false); }
  };

  const generatePlan = async (event?: FormEvent) => {
    event?.preventDefault();
    const validation = validateAll();
    if (validation) { setError(validation); return; }
    if (!token) { setError("Please sign in to create a private wellness plan."); return; }
    setBusy(true); setError(""); setNotice("Building your personalized plan...");
    try {
      const data = payload();
      await apiRequest("/wellness/assessment", token, "POST", data);
      const query = new URLSearchParams();
      if (temporaryCoordinates) { query.set("latitude", String(temporaryCoordinates.latitude)); query.set("longitude", String(temporaryCoordinates.longitude)); }
      const result = await apiRequest(`/wellness/generate-plan${query.size ? `?${query}` : ""}`, token, "POST", data);
      setPlan(result); setStep(7); setAir(result.environment_guidance || null);
      setNotificationItems((items) => ["Personalized wellness plan updated.", ...items].slice(0, 6));
      toast("Your plan is ready. Review the sources, activity outline, and safety notes.");
    } catch (err: any) { setError(err.message || "We could not generate a plan right now."); }
    finally { setBusy(false); }
  };

  const fetchAir = async (coords?: { latitude: number; longitude: number }) => {
    if (!token) return;
    const country = String(profile.country || "").trim();
    if (!coords && (!profile.city?.trim() || !country)) { setError("Enter a city and country before retrieving environmental information."); return; }
    setAirLoading(true); setError("");
    try {
      const q = new URLSearchParams(coords ? { latitude: String(coords.latitude), longitude: String(coords.longitude) } : {
        city: profile.city.trim(), state: profile.state || "", country,
      });
      const data = await apiRequest(`/wellness/environment/air?${q}`, token);
      setAir(data); setTemporaryCoordinates(coords || null);
      if (!data.available) toast("Current air-quality data unavailable for this selected location.");
    } catch (err: any) { setAir({ available: false, message: err.message || "Current air-quality data unavailable." }); }
    finally { setAirLoading(false); }
  };

  const getMyLocation = () => {
    if (!locationConsent) { setError("Please read and accept the location-use note before requesting browser location."); return; }
    if (!navigator.geolocation) { setError("Browser location is unavailable. Enter a city manually instead."); return; }
    setAirLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { latitude: Number(position.coords.latitude.toFixed(2)), longitude: Number(position.coords.longitude.toFixed(2)) };
        void fetchAir(coords);
      },
      (geoError) => { setAirLoading(false); setError(geoError.code === geoError.PERMISSION_DENIED ? "Location permission denied. Enter a city manually instead." : "Unable to retrieve a location. Enter a city manually instead."); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const updatePreferences = async (key: keyof typeof notificationPrefs) => {
    const next = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(next);
    if (!token) return;
    try { await apiRequest("/wellness/notifications/preferences", token, "PUT", next); }
    catch { setNotificationPrefs(notificationPrefs); toast("Notification preferences could not be saved."); }
  };

  const enableBrowserReminders = async () => {
    if (!("Notification" in window)) { toast("Browser notifications are not supported here."); return; }
    const permission = await Notification.requestPermission();
    toast(permission === "granted" ? "Browser reminders are enabled for this session." : "Browser notifications were not enabled.");
  };

  useEffect(() => {
    if (!plan?.plan_id) return;
    const daily = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !("Notification" in window) || Notification.permission !== "granted") return;
      if (notificationPrefs.hydration) new Notification("Wellness reminder", { body: "Take a hydration break if that fits your routine." });
    }, 60 * 60 * 1000);
    const movement = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !("Notification" in window) || Notification.permission !== "granted") return;
      if (notificationPrefs.movement_break) new Notification("Movement break", { body: "Consider a brief movement break when convenient." });
    }, 90 * 60 * 1000);
    return () => { window.clearInterval(daily); window.clearInterval(movement); };
  }, [plan?.plan_id, notificationPrefs.hydration, notificationPrefs.movement_break]);

  const bmi = useMemo(() => {
    const height = profile.height_unit === "ft/in" ? ((Number(profile.height_value) || 0) * 12 + (Number(profile.height_inches) || 0)) * 0.0254 : (Number(profile.height_value || profile.height_cm) || 0) / 100;
    const weight = profile.weight_unit === "lb" ? (Number(profile.weight_value) || 0) * 0.45359237 : Number(profile.weight_value || profile.weight_kg) || 0;
    return height > 0 && weight > 0 ? (weight / (height * height)).toFixed(1) : "â€”";
  }, [profile]);
  const bmiCategory = bmi === "â€”" ? "Not available" : Number(bmi) < 18.5 ? "Below reference range" : Number(bmi) < 25 ? "Within reference range" : Number(bmi) < 30 ? "Above reference range" : "Higher reference range";
  const scheduled = plan?.weekly_schedule || [];
  const today = weekdays[(clock.getDay() + 6) % 7];
  const activeWorkout = scheduled.find((item) => item.day === selectedDay) || scheduled.find((item) => item.day === today) || scheduled[0];
  const dateOfPlan = plan?.generated_at ? new Date(plan.generated_at).toLocaleString() : "";

  if (loading) return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin text-sky-400"/>Loading profile...</span></div>;

  return <div className={`wellness-page space-y-5 pb-10 ${lightMode ? "wellness-light" : ""}`} data-theme={lightMode ? "light" : "dark"}>
    <header className={`${cardClass} relative overflow-visible`}>
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-sky-500 via-cyan-300 to-indigo-500" />
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-4"><WellnessBrand/><div className="border-l border-slate-700 pl-4"><h1 className="text-xl font-semibold text-white sm:text-2xl">Personalized Wellness Intelligence</h1><p className="mt-1 text-xs text-slate-500">Personalized routines, real food data, clear sources.</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-slate-800 bg-[#080e19] px-3 py-2"><div className="flex items-center gap-2 font-mono text-sm text-slate-100"><Clock3 className="h-3.5 w-3.5 text-sky-300"/>{clockTime(clock)}</div><p className="mt-0.5 text-right text-[10px] text-slate-500">{localDate(clock)}</p></div>
          <button aria-label={lightMode ? "Switch to dark theme" : "Switch to light theme"} onClick={()=>setLightMode(!lightMode)} className="rounded-lg border border-slate-700 bg-[#080e19] p-2.5 text-slate-300 hover:border-sky-400 hover:text-sky-200">{lightMode?<Moon className="h-4 w-4"/>:<Sun className="h-4 w-4"/>}</button>
          <div className="relative"><button aria-label="Open wellness notifications" aria-expanded={notificationOpen} onClick={()=>setNotificationOpen(!notificationOpen)} className="relative rounded-lg border border-slate-700 bg-[#080e19] p-2.5 text-slate-300 hover:border-sky-400"><Bell className="h-4 w-4"/>{notificationItems.length>0&&<span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-sky-500 text-[9px] text-white">{notificationItems.length}</span>}</button>{notificationOpen&&<div className="absolute right-0 top-12 z-40 w-[min(340px,calc(100vw-40px))] rounded-xl border border-slate-700 bg-[#0b1220] p-4 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Reminders & updates</h3><button aria-label="Close notifications" onClick={()=>setNotificationOpen(false)}><X className="h-4 w-4 text-slate-400"/></button></div><div className="mt-3 space-y-2">{reminderOptions.map(([key,label])=><label key={key} className="flex items-center justify-between text-xs text-slate-300"><span>{label}</span><input type="checkbox" checked={notificationPrefs[key]} onChange={()=>void updatePreferences(key)} className="accent-sky-500"/></label>)}</div><button onClick={()=>void enableBrowserReminders()} className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-sky-200 hover:bg-sky-500/10">Enable browser reminders</button><div className="mt-3 border-t border-slate-800 pt-2">{notificationItems.length?notificationItems.map((item,i)=><p key={i} className="py-1 text-xs text-slate-400">{item}</p>):<p className="py-1 text-xs text-slate-500">No new updates yet.</p>}</div></div>}</div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#080e19] px-2.5 py-2"><div className="grid h-7 w-7 place-items-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-200">{user?.full_name?.[0]||"U"}</div><span className="max-w-[100px] truncate text-xs text-slate-300">{user?.full_name||"Account"}</span></div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-sm leading-relaxed text-slate-400">Build a personalized lifestyle plan using your profile, activity patterns and authorized environmental information.</p><span className="flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[.07] px-3 py-1.5 text-[11px] text-sky-200"><Sparkles className="h-3.5 w-3.5"/>AI-Assisted Wellness Personalization</span></div>
    </header>

    <div className="flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[.045] p-4 text-xs leading-relaxed text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"/><p>This module provides general wellness guidance based on user-provided information and environmental data. It is not a medical diagnosis or treatment recommendation. AI-assisted wellness output is not a medical diagnosis.</p></div>

    {notice&&<div role="status" className="fixed right-5 top-20 z-50 flex max-w-md items-center gap-2 rounded-xl border border-sky-400/30 bg-[#0b1726] p-3 text-sm text-sky-100 shadow-xl"><CheckCircle2 className="h-4 w-4 shrink-0 text-sky-300"/>{notice}<button className="ml-auto" onClick={()=>setNotice("")} aria-label="Dismiss notification"><X className="h-4 w-4"/></button></div>}
    {error&&<div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[.06] p-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/><span>{error}</span><button className="ml-auto" onClick={()=>setError("")} aria-label="Dismiss error"><X className="h-4 w-4"/></button></div>}

    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <main className="space-y-5">
        <section className={cardClass} aria-label="Wellness assessment progress">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">Assessment progress</p><h2 className="mt-1 text-sm font-semibold text-slate-100">Step {step+1} of 8 <span className="font-normal text-slate-500">Â· {steps[step]}</span></h2></div><span className="font-mono text-xs text-sky-300">{Math.round(((step+1)/8)*100)}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-300" style={{width:`${((step+1)/8)*100}%`}}/></div>
          <div className="mt-4 grid grid-cols-4 gap-1.5 md:grid-cols-8">{steps.map((label,index)=><button key={label} aria-current={step===index?"step":undefined} onClick={()=>{if(index<=step){setStep(index);setError("")}}} className={`rounded-md px-1 py-1.5 text-[9px] leading-tight transition sm:text-[10px] ${index===step?"bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30":index<step?"text-emerald-300 hover:bg-slate-800":"text-slate-600"}`}><span className="block font-mono">{index<step?"âœ“":`0${index+1}`}</span><span className="mt-1 hidden sm:block">{label}</span></button>)}</div>
        </section>

        <form onSubmit={generatePlan} className={`${cardClass} min-h-[460px]`}>
          {step===0&&<div className="space-y-5"><StepTitle icon={<HeartPulse className="h-4 w-4"/>} eyebrow="STEP 01 Â· PROFILE" title="Personal profile" hint="A few optional preferences help make the plan more useful."/><div className="grid gap-4 sm:grid-cols-2"><ReadOnly label="Full name" value={user?.full_name||"â€”"} note="From your account profile"/><Input label="Age" type="number" min="18" max="120" value={profile.age} onChange={(v)=>update("age",v)} suffix="years"/><Select label="Sex / gender Â· optional" value={profile.gender} onChange={(v)=>update("gender",v)} options={[["","Prefer not to say"],["Female","Female"],["Male","Male"],["Non-binary","Non-binary"],["Self-described","Self-described"]]}/><Select label="Preferred language" value={profile.preferred_language} onChange={(v)=>update("preferred_language",v)} options={[["English","English"],["à°¤à±†à°²à±à°—à±","à°¤à±†à°²à±à°—à±"],["à¤¹à¤¿à¤¨à¥à¤¦à¥€","à¤¹à¤¿à¤¨à¥à¤¦à¥€"],["Other","Other"]]}/><Select label="Diet preference" value={profile.diet_preference} onChange={(v)=>update("diet_preference",v)} options={dietChoices.map((v)=>[v,v])}/><Select label="Food preference" value={profile.food_preference} onChange={(v)=>update("food_preference",v)} options={["South Indian","Andhra","Telangana","North Indian","Other"].map(v=>[v,v])}/></div><div><p className="text-xs font-medium text-slate-300">Food allergies Â· select all that apply</p><ChipGroup options={allergyChoices} values={profile.allergies} onToggle={(v)=>toggleList("allergies",v)}/><Input label="Other allergies" value={profile.custom_allergies} onChange={(v)=>update("custom_allergies",v)} placeholder="Separate with commas"/></div></div>}

          {step===1&&<div className="space-y-5"><StepTitle icon={<Activity className="h-4 w-4"/>} eyebrow="STEP 02 Â· BODY METRICS" title="Body metrics" hint="Unit conversions stay in this browser; the profile stores centimeters and kilograms."/><div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-800 bg-[#080e19] p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-300">Height</p><select aria-label="Height unit" value={profile.height_unit} onChange={e=>update("height_unit",e.target.value)} className="rounded border border-slate-700 bg-[#0b1220] px-2 py-1 text-xs text-slate-300"><option>cm</option><option>ft/in</option></select></div>{profile.height_unit==="cm"?<Input label="Centimeters" type="number" min="81" max="250" value={profile.height_value} onChange={v=>update("height_value",v)} suffix="cm"/>:<div className="grid grid-cols-2 gap-2"><Input label="Feet" type="number" min="2" max="8" value={profile.height_value} onChange={v=>update("height_value",v)}/><Input label="Inches" type="number" min="0" max="11" value={profile.height_inches} onChange={v=>update("height_inches",v)}/></div>}</div><div className="rounded-xl border border-slate-800 bg-[#080e19] p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-300">Weight</p><select aria-label="Weight unit" value={profile.weight_unit} onChange={e=>update("weight_unit",e.target.value)} className="rounded border border-slate-700 bg-[#0b1220] px-2 py-1 text-xs text-slate-300"><option>kg</option><option>lb</option></select></div><Input label={profile.weight_unit==="lb"?"Pounds":"Kilograms"} type="number" min="25" max="770" value={profile.weight_value} onChange={v=>update("weight_value",v)} suffix={profile.weight_unit}/></div></div><div className="rounded-xl border border-sky-400/15 bg-sky-400/[.04] p-5"><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-slate-400">Body Mass Index</p><p className="mt-1 text-3xl font-semibold text-sky-200">{bmi}</p><p className="mt-1 text-xs text-slate-400">{bmiCategory}</p></div><p className="max-w-xs text-right text-xs leading-relaxed text-slate-500">BMI is a screening/body-size measure and is not a diagnosis. Do not use it alone to make health conclusions.</p></div></div></div>}

          {step===2&&<div className="space-y-5"><StepTitle icon={<Moon className="h-4 w-4"/>} eyebrow="STEP 03 Â· DAILY PATTERNS" title="Lifestyle" hint="Tell us about a typical day; these are self-reported wellness preferences."/><div className="grid gap-4 sm:grid-cols-2"><Input label="Sleep duration" type="number" min="0" max="24" value={profile.sleep_hours} onChange={v=>update("sleep_hours",v)} suffix="hours / night"/><Select label="Sleep schedule" value={profile.sleep_schedule} onChange={v=>update("sleep_schedule",v)} options={[["","Choose one"],["Consistent","Mostly consistent"],["Variable","Varies day to day"],["Shift work","Shift work"]]}/><Input label="Daily sitting" type="number" min="0" max="24" value={profile.sitting_hours} onChange={v=>update("sitting_hours",v)} suffix="hours / day"/><Input label="Screen time" type="number" min="0" max="24" value={profile.screen_time_hours} onChange={v=>update("screen_time_hours",v)} suffix="hours / day"/><Input label="Water intake" type="number" min="0" max="30" step="0.1" value={profile.water_intake_liters} onChange={v=>update("water_intake_liters",v)} suffix="liters Â· self estimate"/><Input label="Meals per day" type="number" min="1" max="6" value={profile.meals_per_day} onChange={v=>update("meals_per_day",v)} suffix="meals"/><Select label="Smoking" value={profile.smoking} onChange={v=>update("smoking",v)} options={frequencyOptions}/><Select label="Alcohol" value={profile.alcohol_frequency} onChange={v=>update("alcohol_frequency",v)} options={frequencyOptions}/><Select label="Caffeine" value={profile.caffeine_frequency} onChange={v=>update("caffeine_frequency",v)} options={frequencyOptions}/><Select label="Fruit & vegetable frequency" value={profile.fruit_vegetable_frequency} onChange={v=>update("fruit_vegetable_frequency",v)} options={[["","Choose one"],["Rarely","Rarely"],["Several_weekly","Several times a week"],["daily","Daily"],["multiple_daily","Multiple times daily"]]}/><Select label="Processed food frequency" value={profile.processed_food_frequency} onChange={v=>update("processed_food_frequency",v)} options={frequencyOptions}/><Select label="Sugary drinks" value={profile.sugary_drink_frequency} onChange={v=>update("sugary_drink_frequency",v)} options={frequencyOptions}/></div><div><p className="text-xs font-medium text-slate-300">Activities you do or enjoy</p><ChipGroup options={["Walking","Running","Cycling","Strength training","Yoga","Sports"]} values={profile.activity_types} onToggle={v=>toggleList("activity_types",v)}/></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Exercise sessions per week" type="number" min="0" max="30" value={profile.exercise_sessions_per_week} onChange={v=>update("exercise_sessions_per_week",v)}/><Input label="Average session duration" type="number" min="0" max="300" value={profile.average_session_minutes} onChange={v=>update("average_session_minutes",v)} suffix="minutes"/></div></div>}

          {step===3&&<div className="space-y-5"><StepTitle icon={<ShieldCheck className="h-4 w-4"/>} eyebrow="STEP 04 Â· OPTIONAL CONTEXT" title="Family history" hint="This information is optional and is not converted into a medical risk score."/><div className="rounded-xl border border-slate-800 bg-[#080e19] p-4"><p className="text-sm font-medium text-slate-200">Does your family have a history of brain tumors?</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{["No","Yes","Not sure","Prefer not to say"].map(value=><button type="button" key={value} aria-pressed={profile.family_history===value} onClick={()=>update("family_history",value)} className={`rounded-lg border px-3 py-2 text-xs ${profile.family_history===value?"border-sky-400 bg-sky-400/10 text-sky-200":"border-slate-700 text-slate-400 hover:bg-slate-800"}`}>{value}</button>)}</div></div>{profile.family_history==="Yes"&&<><div><p className="text-xs font-medium text-slate-300">Relationship Â· optional</p><ChipGroup options={["Parent","Sibling","Grandparent","Other"]} values={profile.family_relationships} onToggle={v=>toggleList("family_relationships",v)}/></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[.04] p-4 text-xs leading-relaxed text-slate-300"><input type="checkbox" checked={profile.family_history_consent} onChange={e=>update("family_history_consent",e.target.checked)} className="mt-0.5 accent-sky-500"/><span><strong className="text-amber-200">I consent to saving this family-history information with my private wellness profile.</strong><br/>If unchecked, the family-history answer and relationships will not be stored.</span></label></>}<p className="rounded-lg border border-slate-800 p-3 text-xs leading-relaxed text-slate-500">Family history information may be relevant to discussions with a qualified healthcare professional. It is not a diagnosis or risk estimate.</p></div>}

          {step===4&&<div className="space-y-5"><StepTitle icon={<Watch className="h-4 w-4"/>} eyebrow="STEP 05 Â· ACTIVITY PROFILE" title="Work & activity" hint="Used only to shape general movement suggestions; no medical capacity is assessed."/><div className="grid gap-4 sm:grid-cols-2"><Select label="Profession" value={profile.profession} onChange={v=>update("profession",v)} options={["Student","Software / IT","Office / Desk","Teacher","Healthcare","Agriculture","Construction","Driver","Retail","Manufacturing","Sports","Other"].map(v=>[v,v])}/><Select label="Physical workload" value={profile.physical_workload} onChange={v=>update("physical_workload",v)} options={[["Low","Low"],["Moderate","Moderate"],["High","High"]]}/><Select label="Mental workload" value={profile.mental_workload} onChange={v=>update("mental_workload",v)} options={[["Low","Low"],["Moderate","Moderate"],["High","High"]]}/><Input label="Sitting at work" type="number" min="0" max="24" value={profile.sitting_hours_work} onChange={v=>update("sitting_hours_work",v)} suffix="hours / day"/><Input label="Standing" type="number" min="0" max="24" value={profile.standing_hours} onChange={v=>update("standing_hours",v)} suffix="hours / day"/><Input label="Walking" type="number" min="0" max="24" value={profile.walking_hours} onChange={v=>update("walking_hours",v)} suffix="hours / day"/></div><div className="grid gap-3 sm:grid-cols-2"><Toggle label="Pain or injury currently affects movement" checked={profile.pain_or_injury} onChange={v=>update("pain_or_injury",v)}/><Toggle label="Physical limitation to consider" checked={profile.physical_limitations} onChange={v=>update("physical_limitations",v)}/></div>{(profile.pain_or_injury||profile.physical_limitations)&&<p className="rounded-lg border border-amber-400/20 bg-amber-400/[.04] p-3 text-xs leading-relaxed text-amber-200">Consider professional medical/fitness guidance before starting or modifying exercise when pain, injury or medical conditions are present. No high-intensity plan will be generated.</p>}</div>}

          {step===5&&<div className="space-y-5"><StepTitle icon={<MapPin className="h-4 w-4"/>} eyebrow="STEP 06 Â· ENVIRONMENT" title="Location & environment" hint="City-level location is optional. Exact coordinates are used only for a temporary air-quality lookup and are not saved."/><div className="rounded-xl border border-sky-400/15 bg-sky-400/[.04] p-4"><p className="text-xs leading-relaxed text-slate-300">We use your location to retrieve environmental information such as local air-quality measurements. Exact location is not publicly displayed or stored in your profile.</p><label className="mt-3 flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" checked={locationConsent} onChange={e=>setLocationConsent(e.target.checked)} className="mt-0.5 accent-sky-500"/>I understand and consent to a one-time browser location lookup when I click â€œUse My Locationâ€.</label><button type="button" disabled={!locationConsent||airLoading} onClick={getMyLocation} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs text-sky-100 disabled:opacity-40"><MapPin className="h-3.5 w-3.5"/>{airLoading?"Retrieving environmental information...":"Use My Location"}</button></div><p className="text-center text-[10px] uppercase tracking-widest text-slate-600">or enter a broad location manually</p><div className="grid gap-4 sm:grid-cols-2"><Input label="Country" value={profile.country} onChange={v=>update("country",v)} placeholder="e.g. India"/><Input label="State / region" value={profile.state} onChange={v=>update("state",v)}/><Input label="District" value={profile.district} onChange={v=>update("district",v)}/><Input label="City" value={profile.city} onChange={v=>update("city",v)}/></div><button type="button" disabled={airLoading} onClick={()=>void fetchAir()} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-50"><Wind className="h-4 w-4"/>{airLoading?"Retrieving environmental information...":"Check local air-quality measurements"}</button><AirCard air={air} loading={airLoading}/><div className="rounded-xl border border-slate-800 bg-[#080e19] p-4"><div className="flex items-center gap-2 text-sm font-medium text-slate-200"><Database className="h-4 w-4 text-sky-300"/>Water quality</div><p className="mt-2 text-xs text-slate-500">Water-quality data unavailable for this location. No household water quality is inferred from a city name.</p><p className="mt-2 text-[10px] text-slate-600">Source: none Â· Last updated: â€”</p></div></div>}

          {step===6&&<div className="space-y-5"><StepTitle icon={<Sparkles className="h-4 w-4"/>} eyebrow="STEP 07 Â· PLAN PREFERENCES" title="Goals & preferences" hint="The weekly outline is deterministic and based on your selections and available exercise records."/><div className="grid gap-4 sm:grid-cols-2"><Select label="Wellness goal" value={profile.goal} onChange={v=>update("goal",v)} options={["Build consistency","General strength","Cardio endurance","Mobility","Maintain routine"].map(v=>[v,v])}/><Select label="Activity experience" value={profile.experience} onChange={v=>update("experience",v)} options={[["Beginner","Beginner"],["Intermediate","Intermediate"],["Experienced","Experienced"]]}/><Input label="Preferred session duration" type="number" min="10" max="120" value={profile.session_minutes} onChange={v=>update("session_minutes",v?Number(v):"")} suffix="minutes"/></div><div><p className="text-xs font-medium text-slate-300">Available equipment</p><ChipGroup options={["No equipment","Dumbbell","Resistance band","Barbell","Bench","Machine"]} values={profile.equipment} onToggle={v=>toggleList("equipment",v)}/></div><div><p className="text-xs font-medium text-slate-300">Preferred workout days</p><ChipGroup options={weekdays} values={profile.workout_days} onToggle={v=>toggleList("workout_days",v)}/></div><div className="grid gap-3 sm:grid-cols-2"><Toggle label="Hydration reminder" checked={profile.water_reminder} onChange={v=>update("water_reminder",v)}/><Toggle label="Movement-break reminder" checked={profile.movement_reminder} onChange={v=>update("movement_reminder",v)}/></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-400/[.05] p-4 text-xs leading-relaxed text-slate-300"><input type="checkbox" checked={profile.consent_personalization} onChange={e=>update("consent_personalization",e.target.checked)} className="mt-0.5 accent-sky-500"/><span><strong className="text-sky-100">I understand this information will be stored in my private wellness profile to personalize general wellness guidance.</strong><br/>You can view, edit, or delete the profile later. Location and family-history data use separate consent controls above.</span></label></div>}

          {step===7&&<div className="space-y-5"><StepTitle icon={<CheckCircle2 className="h-4 w-4"/>} eyebrow="STEP 08 Â· REVIEW" title={plan?"Your personalized plan":"Review & generate plan"} hint={plan?`Generated ${dateOfPlan}`:"Check your profile and choices before generating your general wellness plan."}/>{plan?<PlanSummary plan={plan} onNotify={toast}/>:<div className="grid gap-3 sm:grid-cols-2"><SummaryItem label="Profile" value={`${profile.age||"â€”"} years Â· ${profile.gender||"Gender not specified"} Â· ${profile.preferred_language||"English"}`}/><SummaryItem label="Diet preference" value={`${profile.diet_preference} Â· ${profile.food_preference}`}/><SummaryItem label="Body metrics" value={`BMI ${bmi} Â· screening/body-size measure only`}/><SummaryItem label="Activity profile inputs" value={`${profile.profession} Â· ${profile.physical_workload} physical / ${profile.mental_workload} mental workload`}/><SummaryItem label="Environment" value={air?.available?`OpenAQ Â· ${air.location_name||profile.city||"local station"}`:profile.city?`${profile.city}, ${profile.country} Â· data not yet retrieved`:"No location provided"}/><SummaryItem label="Plan preferences" value={`${profile.goal} Â· ${profile.experience} Â· ${profile.session_minutes} min Â· ${(profile.workout_days||[]).join(", ")}`}/></div>}{plan&&<p className="rounded-lg border border-slate-800 p-3 text-xs text-slate-400">Source values are shown with their providers. Missing provider data remains unavailable; it is never filled with estimates.</p>}</div>}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4"><div className="flex gap-2"><button type="button" onClick={()=>{setStep(Math.max(0,step-1));setError("")}} disabled={step===0||busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"><ArrowLeft className="h-3.5 w-3.5"/>Back</button><button type="button" onClick={()=>void saveDraft()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"><Database className="h-3.5 w-3.5"/>Save Draft</button></div>{step<7?<button type="button" onClick={advance} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400">{step===6?"Review":"Continue"}<ArrowRight className="h-4 w-4"/></button>:<button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50">{busy?<RefreshCw className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}{plan?"Generate Updated Plan":"Generate My Wellness Plan"}</button>}</div>
        </form>

        {plan&&<>
          <section className={cardClass}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.18em] text-sky-300">YOUR PERSONALIZED PLAN</p><h2 className="mt-1 text-lg font-semibold text-white">General wellness guidance</h2></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/[.06] px-3 py-1.5 text-[10px] text-emerald-200">Plan Â· {dateOfPlan}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><SummaryItem label="Activity profile" value={plan.activity_profile}/><SummaryItem label="BMI" value={`${plan.profile_summary?.bmi??"â€”"} Â· ${plan.profile_summary?.bmi_category??"not available"}`}/><SummaryItem label="Today's workout" value={scheduled.some((entry)=>entry.day===today)?`${today} Â· ${scheduled.find((entry)=>entry.day===today)?.exercises?.length||0} library exercises`:"No session scheduled today"}/></div></section>

          <div className="wellness-export-bar flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0b1220] px-4 py-3"><div><p className="text-sm font-semibold text-slate-100">Keep a copy of your plan</p><p className="mt-1 text-[11px] text-slate-500">Branded downloads include your meal count, source notes, activities, and safety guidance.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>void downloadPlan("pdf")} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-400"><Download className="h-3.5 w-3.5"/>PDF</button><button type="button" onClick={()=>void downloadPlan("docx")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-sky-400"><FileText className="h-3.5 w-3.5"/>Word</button><button type="button" onClick={()=>void downloadPlan("txt")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-sky-400"><FileText className="h-3.5 w-3.5"/>Text</button></div></div>\n          <section className={cardClass}><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300"><Utensils className="h-4 w-4"/>Diet guidance</div><p className="mt-1 text-xs text-slate-500">Food names and nutrient values are returned from USDA FoodData Central, not estimated.</p></div><span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-400">{plan.diet_guidance?.length||0} meals / day · USDA source</span></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{plan.diet_guidance?.map((meal:any)=><MealGuidanceCard key={meal.meal} meal={meal} token={token} onNotify={toast}/>)}</div>{profile.allergies?.length>0&&<p className="mt-3 rounded-lg border border-amber-400/15 bg-amber-400/[.04] p-3 text-[11px] leading-relaxed text-amber-100">Declared allergens screened by food-name matching only: {profile.allergies.join(", ")}. This database does not verify product ingredients or cross-contact; always check the label.</p>}</section>

          <section className={cardClass}><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-200"><Activity className="h-4 w-4"/>Weekly activity plan</div><p className="mt-1 text-xs text-slate-500">Exercises come from the connected exercise library; schedule rules are listed below.</p></div><select aria-label="Select workout day" value={selectedDay||activeWorkout?.day||""} onChange={e=>setSelectedDay(e.target.value)} className="rounded-lg border border-slate-700 bg-[#080e19] px-3 py-2 text-xs text-slate-200">{scheduled.map((entry:any)=><option key={entry.day}>{entry.day}</option>)}</select></div>{!plan.exercise_plan?.available?<p className="mt-4 rounded-lg border border-dashed border-slate-800 p-5 text-center text-sm text-slate-500">{plan.exercise_plan?.message||"No exercise data available."}</p>:activeWorkout?<><div className="mt-4 flex flex-wrap gap-2">{activeWorkout.exercises.map((exercise:any)=><span key={exercise.id} className="rounded-full border border-slate-700 bg-[#080e19] px-3 py-1.5 text-xs text-slate-300">{exercise.name}</span>)}</div><p className="mt-3 text-xs text-slate-500">{activeWorkout.warmup_minutes} min self-paced warm-up Â· {activeWorkout.cooldown_minutes} min cool-down Â· {plan.exercise_plan.note}</p><p className="mt-2 text-[10px] text-slate-600">Source: ExerciseDB V1. Media is shown only when returned by the provider.</p><WorkoutTimer key={`${plan.plan_id}-${activeWorkout.day}`} workout={activeWorkout} planId={plan.plan_id} day={activeWorkout.day} token={token} onNotify={toast}/></>:<p className="mt-4 text-sm text-slate-500">Choose a day to see its scheduled activity.</p>}</section>

          <section className={cardClass}><div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-200"><Wind className="h-4 w-4"/>Environmental information</div><AirCard air={plan.environment_guidance} loading={false}/><div className="mt-3 rounded-xl border border-slate-800 bg-[#080e19] p-3"><p className="text-xs text-slate-300">{plan.water_quality?.message}</p><p className="mt-1 text-[10px] text-slate-600">Source: {plan.water_quality?.source||"none"} Â· Retrieved: {plan.water_quality?.retrieved_at||"â€”"}</p></div></section>

          <section className={cardClass}><h2 className="text-sm font-semibold text-slate-100">Wellness indicators</h2><p className="mt-1 text-xs text-slate-500">Transparent rules from your self-reported information; these are not medical scores.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{plan.wellness_indicators?.map(item=><div key={item.name} className="rounded-lg border border-slate-800 bg-[#080e19] p-3"><div className="flex justify-between gap-2"><p className="text-xs text-slate-200">{item.name}</p><span className={`text-[10px] ${item.status==="Good"?"text-emerald-300":item.status==="Needs Attention"?"text-amber-300":"text-slate-500"}`}>{item.status}</span></div><p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">{item.rule}</p></div>)}</div><details className="mt-4 rounded-lg border border-slate-800 bg-[#080e19] p-3"><summary className="cursor-pointer text-xs text-slate-300">How this plan was personalized</summary><ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-500">{plan.personalization_rules?.map((rule,index)=><li key={index}>{rule}</li>)}</ul></details></section>

          {plan.safety_notes?.length>0&&<section className="rounded-2xl border border-amber-400/20 bg-amber-400/[.04] p-5"><h2 className="text-sm font-semibold text-amber-100">Safety notes</h2><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-amber-100/80">{plan.safety_notes.map((note,index)=><li key={index}>{note}</li>)}</ul></section>}
        </>}
      </main>

      <aside className="space-y-5 xl:sticky xl:top-20">
        <section className={cardClass}><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">DAILY DASHBOARD</p><h2 className="mt-1 text-sm font-semibold text-slate-100">Today Â· {today}</h2></div><CalendarDays className="h-4 w-4 text-sky-300"/></div><div className="mt-4 space-y-3">{[["Today's workout",scheduled.find(x=>x.day===today)?.exercises?.length?`${scheduled.find(x=>x.day===today).exercises.length} exercises scheduled`:plan?"Rest / no session scheduled":"Generate a plan to see the schedule"],["Nutrition guidance",plan?.diet_guidance?.find(x=>x.meal==="Breakfast"&&x.available)?.food||"No nutrition data available"],["Water reminder",profile.water_reminder?profile.water_intake_liters?`Your self-reported intake: ${profile.water_intake_liters} L`:"Set your own reminder preference":"Reminders off"],["Movement break",profile.movement_reminder?"Optional reminder enabled":"Reminders off"],["Sleep",profile.sleep_hours?`Self-reported ${profile.sleep_hours} hours / night`:"No sleep information"]].map(([label,value])=><div key={label} className="flex items-start justify-between gap-3 border-b border-slate-800/70 pb-2 last:border-0"><span className="text-[11px] text-slate-500">{label}</span><span className="max-w-[160px] text-right text-xs text-slate-300">{value}</span></div>)}</div></section>
        <section className={cardClass}><div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Wind className="h-4 w-4 text-cyan-300"/>Local air quality</div><AirCard air={air||plan?.environment_guidance} loading={airLoading}/><button type="button" onClick={()=>{setStep(5);window.scrollTo({top:0,behavior:"smooth"})}} className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-sky-400 hover:text-sky-200">Review location settings</button></section>
        <section className={cardClass}><div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Database className="h-4 w-4 text-sky-300"/>Information sources</div><div className="mt-3 space-y-3 text-xs"><Source name="USDA FoodData Central" detail="Nutrient values and food records"/><Source name="ExerciseDB V1" detail="Exercise names and instructions"/><Source name="OpenAQ API v3" detail="Location-based pollutant measurements"/><p className="rounded-lg border border-slate-800 bg-[#080e19] p-3 text-[10px] leading-relaxed text-slate-500">No water-quality provider is configured. No AQI value is calculated. Missing provider data is shown as unavailable.</p></div></section>
        <button type="button" onClick={async()=>{if(!token)return;const ok=window.confirm("Delete your saved wellness profile, assessments, plans, environment snapshots, workout sessions, and reminder settings? This cannot be undone.");if(!ok)return;try{await apiRequest("/wellness/profile",token,"DELETE");setProfile(initialProfile);setPlan(null);setAir(null);setStep(0);toast("Saved wellness data was deleted.");}catch(e:any){setError(e.message||"Could not delete saved data.");}}} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/20 px-3 py-2.5 text-xs text-rose-200 hover:bg-rose-500/[.06]"><Trash2 className="h-3.5 w-3.5"/>Delete my wellness data</button>
      </aside>
    </div>
    <footer className="rounded-xl border border-slate-800 bg-[#080e19] p-4 text-[11px] leading-relaxed text-slate-500">BrainTumorVision AI is a research and educational clinical decision-support platform. Wellness recommendations are general educational guidance and are not a substitute for professional medical, nutritional, or fitness advice. AI-assisted wellness output is not a medical diagnosis.</footer>
  </div>;
}

const frequencyOptions: [string,string][] = [["","Choose one"],["Never","Never"],["Rarely","Rarely"],["Weekly","Weekly"],["Daily","Daily"]];

function StepTitle({icon,eyebrow,title,hint}:{icon:React.ReactNode;eyebrow:string;title:string;hint:string}){return <div className="mb-5 flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-200">{icon}</div><div><p className="text-[10px] font-semibold tracking-[.16em] text-sky-300">{eyebrow}</p><h2 className="mt-1 text-lg font-semibold text-white">{title}</h2><p className="mt-1 text-xs text-slate-500">{hint}</p></div></div>}
function Input({label,value,onChange,type="text",placeholder="",suffix,min,max,step}:{label:string;value:any;onChange:(value:string)=>void;type?:string;placeholder?:string;suffix?:string;min?:string;max?:string;step?:string}){return <label className="block text-xs font-medium text-slate-300">{label}<div className="relative"><input className={`${fieldClass} ${suffix?"pr-20":""}`} type={type} value={value??""} min={min} max={max} step={step} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>{suffix&&<span className="pointer-events-none absolute right-3 top-4 text-[10px] text-slate-500">{suffix}</span>}</div></label>}
function Select({label,value,onChange,options}:{label:string;value:any;onChange:(value:string)=>void;options:[string,string][]}){return <label className="block text-xs font-medium text-slate-300">{label}<select className={fieldClass} value={value??""} onChange={e=>onChange(e.target.value)}>{options.map(([v,title])=><option key={`${v}-${title}`} value={v}>{title}</option>)}</select></label>}
function ChipGroup({options,values,onToggle}:{options:string[];values:string[];onToggle:(v:string)=>void}){return <div className="mt-2 flex flex-wrap gap-2">{options.map(option=><button type="button" key={option} aria-pressed={(values||[]).includes(option)} onClick={()=>onToggle(option)} className={`rounded-full border px-3 py-1.5 text-xs transition ${(values||[]).includes(option)?"border-sky-400/50 bg-sky-400/10 text-sky-100":"border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}>{(values||[]).includes(option)&&<Check className="mr-1 inline h-3 w-3"/>}{option}</button>)}</div>}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#080e19] p-3 text-xs text-slate-300">{label}<input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="accent-sky-500"/></label>}
function ReadOnly({label,value,note}:{label:string;value:string;note:string}){return <div className="rounded-lg border border-slate-800 bg-[#080e19] p-3"><p className="text-[10px] text-slate-500">{label} Â· {note}</p><p className="mt-1 text-sm text-slate-200">{value}</p></div>}
function SummaryItem({label,value}:{label:string;value:any}){return <div className="rounded-xl border border-slate-800 bg-[#080e19] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1.5 text-xs leading-relaxed text-slate-200">{value||"â€”"}</p></div>}
function Source({name,detail}:{name:string;detail:string}){return <div className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"/><div><p className="text-slate-200">{name}</p><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div></div>}
function AirCard({air,loading}:{air:any;loading:boolean}){if(loading)return <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><RefreshCw className="h-3.5 w-3.5 animate-spin"/>Retrieving environmental information...</p>;if(!air?.available)return <div className="mt-3 rounded-lg border border-slate-800 bg-[#080e19] p-3"><p className="text-xs text-slate-400">{air?.message||"No current air-quality data available."}</p><p className="mt-1 text-[10px] text-slate-600">Source: {air?.source||"OpenAQ API v3"} Â· Retrieved: {air?.retrieved_at||"â€”"}</p></div>;return <div className="mt-3 rounded-lg border border-slate-800 bg-[#080e19] p-3"><p className="text-xs text-slate-300">{air.location_name||"Nearby monitoring location"}</p><div className="mt-2 space-y-1.5">{air.measurements?.map((item:any,index:number)=><div key={`${item.parameter}-${index}`} className="flex justify-between gap-2 text-xs"><span className="text-slate-400">{item.parameter||"Measurement"}</span><span className="text-slate-200">{item.value} {item.unit||""}</span></div>)}</div><p className="mt-2 text-[10px] text-slate-600">Source: OpenAQ API v3 Â· Measured: {air.measurement_time||"time unavailable"} Â· Retrieved: {air.retrieved_at||"â€”"}</p>{air.activity_guidance&&<p className="mt-2 text-[11px] leading-relaxed text-sky-100">{air.activity_guidance}</p>}</div>}
function PlanSummary({plan,onNotify}:{plan:Plan;onNotify:(text:string)=>void}){return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><SummaryItem label="Profile summary" value={`${plan.profile_summary?.age??"â€”"} years Â· ${plan.profile_summary?.diet_preference??"â€”"} Â· BMI ${plan.profile_summary?.bmi??"â€”"}`}/><SummaryItem label="Activity profile" value={plan.activity_profile}/></div><p className="rounded-lg border border-slate-800 bg-[#080e19] p-3 text-xs text-slate-400">{plan.profile_summary?.bmi_note}</p><p className="text-xs text-slate-500">Plan generated {new Date(plan.generated_at).toLocaleString()}</p>{plan.exercise_plan?.available&&<button type="button" onClick={()=>onNotify("Plan reviewed. Use the weekly activity outline at the bottom of this page.")} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Review workout outline</button>}</div>}
