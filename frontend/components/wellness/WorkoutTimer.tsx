import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";

type Move = { id: string; name: string; reps: number; sets: number; rest_seconds: number; instructions?: string[] };
type WorkoutDay = { day: string; warmup_minutes: number; cooldown_minutes: number; exercises: Move[] };
type Phase = { label: string; kind: "work" | "rest" | "warmup" | "cooldown"; duration: number; exercise?: Move; set?: number };
type Session = { session_id: string; day: string; status: string; started_at: string; elapsed_seconds?: number };

const fmt = (total: number) => `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

export function WorkoutTimer({ workout, planId, day, token, onNotify }: { workout: WorkoutDay; planId: string; day: string; token: string | null; onNotify: (message: string) => void }) {
  const phases = useMemo<Phase[]>(() => {
    const list: Phase[] = [{ label: "Warm-up", kind: "warmup", duration: (workout.warmup_minutes || 5) * 60 }];
    workout.exercises.forEach((move) => {
      for (let set = 1; set <= move.sets; set += 1) {
        list.push({ label: move.name, kind: "work", duration: 45, exercise: move, set });
        if (set < move.sets) list.push({ label: `Rest after ${move.name}`, kind: "rest", duration: move.rest_seconds || 60, exercise: move, set });
      }
    });
    list.push({ label: "Cool-down", kind: "cooldown", duration: (workout.cooldown_minutes || 5) * 60 });
    return list;
  }, [workout]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(phases[0]?.duration || 0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const endAt = useRef(0);
  const activeStartedAt = useRef(0);
  const elapsedAt = useRef(0);
  const phase = phases[index];
  const move = phase?.exercise;
  const progress = phases.length ? ((index + 1) / phases.length) * 100 : 0;

  useEffect(() => {
    setIndex(0); setRemaining(phases[0]?.duration || 0); setRunning(false); setElapsed(0); setSessionId(""); setFinished(false); elapsedAt.current = 0;
  }, [phases]);

  const loadHistory = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/wellness/workout/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setHistory((await response.json()).sessions || []);
    } catch { /* History is optional while the local timer remains usable. */ }
  };

  useEffect(() => { void loadHistory(); }, [token]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      const activeElapsed = elapsedAt.current + Math.floor((Date.now() - activeStartedAt.current) / 1000);
      setElapsed(activeElapsed);
      if (left <= 0) {
        elapsedAt.current = activeElapsed;
        setRunning(false);
        advance(1, true);
      }
    }, 250);
    return () => window.clearInterval(timer);
    // remaining is captured at each phase start/resume; endAt is the timing source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, index]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    if (!token) return "";
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/wellness/workout/start`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: planId, day }),
      });
      if (!response.ok) throw new Error();
      const result = await response.json(); setSessionId(result.session_id); return result.session_id as string;
    } catch { onNotify("Workout history is unavailable right now; the timer can still run."); return ""; }
  }

  async function finish(completed: boolean, finalElapsed = elapsedAt.current + (running ? Math.max(0, Math.floor((Date.now() - activeStartedAt.current) / 1000)) : 0)) {
    setRunning(false); setFinished(true);
    elapsedAt.current = finalElapsed;
    setElapsed(finalElapsed);
    const id = sessionId || await ensureSession();
    if (id && token) {
      setSaving(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/wellness/workout/complete`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ session_id: id, elapsed_seconds: finalElapsed, completed }),
        });
        if (!response.ok) throw new Error();
        await loadHistory();
      } catch { onNotify("Workout completed locally; history could not be synced."); }
      finally { setSaving(false); }
    }
    if (completed) onNotify("Workout completed. Nice work keeping track of your activity.");
  }

  function advance(delta: number, automatic = false) {
    const next = index + delta;
    if (!automatic && running) {
      elapsedAt.current += Math.max(0, Math.floor((Date.now() - activeStartedAt.current) / 1000));
      setElapsed(elapsedAt.current);
    }
    const currentElapsed = elapsedAt.current;
    if (next < 0) { setIndex(0); setRemaining(phases[0]?.duration || 0); return; }
    if (next >= phases.length) { void finish(true, currentElapsed); return; }
    setIndex(next); setRemaining(phases[next].duration); elapsedAt.current = currentElapsed; setElapsed(currentElapsed);
    if (!automatic && running) { activeStartedAt.current = Date.now(); endAt.current = activeStartedAt.current + phases[next].duration * 1000; }
  }

  async function startOrResume() {
    await ensureSession();
    activeStartedAt.current = Date.now();
    endAt.current = activeStartedAt.current + remaining * 1000;
    elapsedAt.current = elapsed;
    setRunning(true); setFinished(false);
  }

  function pause() {
    elapsedAt.current += Math.max(0, Math.floor((Date.now() - activeStartedAt.current) / 1000));
    setElapsed(elapsedAt.current);
    setRunning(false);
  }

  function reset() { setRunning(false); setIndex(0); setRemaining(phases[0]?.duration || 0); setElapsed(0); elapsedAt.current = 0; setSessionId(""); setFinished(false); }

  if (!phase) return null;
  return <section className="wellness-card rounded-2xl border border-slate-800 bg-[#0b1220] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-xs uppercase tracking-wider text-sky-300"><Play className="h-3.5 w-3.5"/>Workout timer</div><h3 className="mt-2 text-lg font-semibold text-white">{finished ? "Session complete" : phase.label}</h3><p className="mt-1 text-xs text-slate-400">{move ? `Set ${phase.set} / ${move.sets} · target ${move.reps} reps · 45-second pace window` : phase.kind === "rest" ? "Rest interval" : `${phase.duration / 60} minute guided interval`}</p></div><div className="min-w-[100px] text-right"><span className="font-mono text-3xl tabular-nums text-sky-200">{fmt(remaining)}</span><p className="mt-1 text-[11px] text-slate-500">Elapsed {fmt(elapsed)}</p></div></div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-[width]" style={{ width: `${progress}%` }} /></div>
    {move?.instructions?.length ? <p className="mt-4 text-xs leading-relaxed text-slate-400">{move.instructions[0]}</p> : null}
    <p className="mt-3 text-[11px] text-slate-500">Work interval is a simple pacing timer, not a prescribed exercise duration. Stop if uncomfortable.</p>
    <div className="mt-5 flex flex-wrap gap-2">
      {!running ? <button onClick={()=>void startOrResume()} disabled={finished||saving} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"><Play className="h-4 w-4"/>{index || elapsed ? "Resume" : "Start"}</button> : <button onClick={pause} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"><Pause className="h-4 w-4"/>Pause</button>}
      <button onClick={()=>advance(1)} disabled={finished} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"><SkipForward className="h-4 w-4"/>Skip</button>
      <button onClick={()=>advance(-1)} disabled={!index||finished} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"><ChevronLeft className="h-4 w-4"/>Previous</button>
      <button onClick={()=>advance(1)} disabled={finished} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40">Next<ChevronRight className="h-4 w-4"/></button>
      <button onClick={()=>void finish(true)} disabled={finished} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"><Square className="h-3.5 w-3.5"/>Finish</button>
      {finished && <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"><RotateCcw className="h-4 w-4"/>Reset</button>}
    </div>
    {finished && !saving && <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4"/>Session saved when history storage is available.</p>}
    {history.length > 0 && <div className="mt-5 border-t border-slate-800 pt-4"><h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent workout history</h4><ul className="mt-2 space-y-2">{history.slice(0, 4).map((item) => <li key={item.session_id} className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-300">{item.day} · {new Date(item.started_at).toLocaleDateString()}</span><span className="text-slate-500">{item.status === "COMPLETED" ? fmt(item.elapsed_seconds || 0) : item.status.toLowerCase()}</span></li>)}</ul></div>}
  </section>;
}
