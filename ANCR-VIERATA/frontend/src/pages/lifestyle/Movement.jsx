import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Activity, ShieldAlert, Filter } from "lucide-react";
import { ActivityTimer } from "@/components/lifestyle/ActivityTimer";
import { MediaPlayer, MediaPlaceholder } from "@/components/media/MediaPlayer";

const SAFETY_LINE = "If you feel severe pain, dizziness, chest pain, breathing difficulty, or another warning sign, please stop and reach out to a qualified professional or emergency support.";

export default function Movement() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [today, setToday] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [intensity, setIntensity] = useState(2);
  const [filter, setFilter] = useState({ difficulty: "", area: "", time: "" });
  const [activityMedia, setActivityMedia] = useState([]);

  const load = () => {
    api.get("/lifestyle/movement/activities").then(({ data }) => setItems(data.items));
    api.get("/lifestyle/movement/today").then(({ data }) => setToday(data));
    api.get("/lifestyle/movement/completions").then(({ data }) => setCompletions(data.items));
    api.get("/lifestyle/routines").then(({ data }) => setRoutines(data.items));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (filter.difficulty && a.difficulty !== filter.difficulty) return false;
      if (filter.area && !(a.target_areas || []).includes(filter.area)) return false;
      if (filter.time) {
        const min = Math.round(a.duration_seconds / 60);
        if (filter.time === "under5" && min > 5) return false;
        if (filter.time === "5to10" && (min < 5 || min > 10)) return false;
        if (filter.time === "over10" && min <= 10) return false;
      }
      return true;
    });
  }, [items, filter]);

  const startActivity = (a) => {
    setSelected(a); setNote(""); setIntensity(2);
    api.get(`/media/for-movement/${a.id}`).then(({ data }) => setActivityMedia(data.items)).catch(() => setActivityMedia([]));
  };

  const logCompletion = async () => {
    try {
      await api.post("/lifestyle/movement/complete", {
        activity_id: selected.id, duration_seconds: selected.duration_seconds,
        intensity, note: note || null,
      });
      toast.success("Movement logged");
      setSelected(null); load();
    } catch { toast.error("Couldn't log"); }
  };

  const logQuick = async (kind, minutes, intVal) => {
    try {
      await api.post("/lifestyle/movement/complete", {
        activity_id: null, custom_name: kind,
        duration_seconds: minutes * 60, intensity: intVal, note: null,
      });
      toast.success(`Logged ${minutes} min ${kind}`);
      load();
    } catch { toast.error("Couldn't log"); }
  };

  const buildRoutine = async () => {
    const name = window.prompt("Name your routine (e.g. 'Studio break')", "My routine");
    if (!name) return;
    const picks = window.prompt("Enter activity IDs comma-separated (e.g. mv_chair,mv_neck)", "mv_chair,mv_neck,mv_wrist");
    if (!picks) return;
    try {
      await api.post("/lifestyle/routines", { name, activity_ids: picks.split(",").map((s) => s.trim()).filter(Boolean) });
      toast.success("Routine saved");
      load();
    } catch { toast.error("Couldn't save routine"); }
  };

  if (selected) {
    return (
      <div className="fade-up" data-testid="movement-activity">
        <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button>
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{selected.category.replace(/_/g, " ")}</div>
          <h1 className="font-display text-3xl tracking-tight mt-1">{selected.title}</h1>
          <p className="text-white/60 text-sm mt-1">{selected.purpose}</p>
          <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
            {Math.round(selected.duration_seconds / 60)} min · {selected.difficulty} · equipment: {selected.equipment.replace(/_/g, " ")}
          </div>

          <div className="mt-5"><ActivityTimer durationSeconds={selected.duration_seconds} testidPrefix="mv-timer" /></div>

          <div className="mt-5" data-testid="movement-media">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Exercise video</div>
            {activityMedia.length === 0 ? (
              <MediaPlaceholder />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activityMedia.map((m) => <MediaPlayer key={m.id} item={m} />)}
              </div>
            )}
          </div>

          <ol className="mt-5 space-y-2 text-sm text-white/80">
            {selected.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-white/40 font-mono text-xs mt-0.5">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>

          {selected.modifications && <div className="mt-4 text-sm text-white/65"><span className="text-white/45 uppercase text-[11px] tracking-[0.22em]">Modifications</span> — {selected.modifications}</div>}

          <div className="mt-6 rounded-2xl border border-viearta-rose/25 bg-viearta-rose/5 p-4 text-sm text-white/85 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-viearta-rose mt-0.5 shrink-0" /> {SAFETY_LINE}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">Perceived intensity</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} data-testid={`mv-int-${n}`} onClick={() => setIntensity(n)}
                    className={`flex-1 h-9 rounded-full text-xs border ${intensity === n ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>{n}</button>
                ))}
              </div>
            </div>
            <textarea data-testid="mv-note" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Private note (optional)" rows={2}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-sm outline-none resize-none placeholder:text-white/30" />
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={logCompletion} data-testid="mv-log"
              className="rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">Log completion</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-up" data-testid="movement-page">
      <button onClick={() => navigate("/lifestyle")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Lifestyle
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Activity className="w-3.5 h-3.5" /> Movement for today
          </div>
          {today?.activity ? (
            <>
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">{today.activity.title}</h1>
              <p className="text-white/65 text-sm mt-2 max-w-2xl">{today.activity.purpose}</p>
              <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/45">
                {Math.round(today.activity.duration_seconds / 60)} min · {today.activity.difficulty} · {today.personalized ? "personalized" : "general"}
              </div>
              <button onClick={() => startActivity(today.activity)} data-testid="mv-start-today"
                className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">Start</button>
            </>
          ) : <div className="text-white/50 text-sm">Loading…</div>}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-2xl tracking-tight">Browse activities</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-white/45" />
            <select value={filter.difficulty} onChange={(e) => setFilter((f) => ({ ...f, difficulty: e.target.value }))}
              data-testid="mv-filter-diff"
              className="bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white">
              <option value="" className="bg-[#0a0a0a]">Any difficulty</option>
              <option value="gentle" className="bg-[#0a0a0a]">Gentle</option>
              <option value="moderate" className="bg-[#0a0a0a]">Moderate</option>
            </select>
            <select value={filter.time} onChange={(e) => setFilter((f) => ({ ...f, time: e.target.value }))}
              data-testid="mv-filter-time"
              className="bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white">
              <option value="" className="bg-[#0a0a0a]">Any duration</option>
              <option value="under5" className="bg-[#0a0a0a]">Under 5 min</option>
              <option value="5to10" className="bg-[#0a0a0a]">5–10 min</option>
              <option value="over10" className="bg-[#0a0a0a]">Over 10 min</option>
            </select>
            <button onClick={buildRoutine} data-testid="mv-build-routine"
              className="rounded-full px-3 py-1.5 text-xs border border-white/15 hover:border-white/30">Build routine</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <button key={a.id} onClick={() => startActivity(a)} data-testid={`mv-${a.id}`}
              className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 glass-hover">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">{a.category.replace(/_/g, " ")}</div>
              <div className="font-display text-lg mt-1">{a.title}</div>
              <div className="text-sm text-white/60 mt-1 line-clamp-2">{a.purpose}</div>
              <div className="mt-2 text-[11px] text-white/45">{Math.round(a.duration_seconds / 60)} min · {a.difficulty}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl tracking-tight mb-3">Quick log activity</h2>
        <p className="text-white/55 text-sm mb-4">For walking, dance, or anything not listed above.</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["Walk", 20, 2], ["Dance", 30, 3], ["Cardio", 25, 3], ["Stretching", 15, 1], ["Strength", 30, 3],
          ].map(([label, mins, intVal]) => (
            <button key={label} onClick={() => logQuick(label, mins, intVal)} data-testid={`mv-quick-${label.toLowerCase()}`}
              className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">
              +{mins} min {label}
            </button>
          ))}
        </div>
      </section>

      {(routines.length > 0 || completions.length > 0) && (
        <section className="glass rounded-3xl p-6 sm:p-8">
          {routines.length > 0 && (
            <div className="mb-6">
              <h2 className="font-display text-2xl tracking-tight mb-3">Your routines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {routines.map((r) => (
                  <div key={r.id} data-testid={`routine-${r.id}`} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="font-display text-lg">{r.name}</div>
                    <div className="text-xs text-white/50 mt-1">{r.activity_ids.length} activities</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {completions.length > 0 && (
            <div>
              <h2 className="font-display text-2xl tracking-tight mb-3">Recent activity</h2>
              <ul className="space-y-2">
                {completions.slice(0, 8).map((c) => {
                  const name = c.custom_name || items.find((a) => a.id === c.activity_id)?.title || "Movement";
                  return (
                    <li key={c.id} className="flex items-center justify-between text-sm rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                      <span>{name}</span>
                      <span className="text-white/45 text-xs">{Math.round(c.duration_seconds / 60)} min · {c.date}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
