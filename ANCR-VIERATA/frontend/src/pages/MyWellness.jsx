import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Activity, Plus, Trash2, BookText, Loader2, Shield, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/15 bg-[#0a0a0a]/90 backdrop-blur-xl px-3 py-2 text-xs">
      <div className="text-white/60 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/85">{p.name}</span>
          <span className="text-white/50 ml-auto">{p.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function MyWellness() {
  const [habits, setHabits] = useState([]);
  const [presets, setPresets] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [journal, setJournal] = useState([]);
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);
  const [rhythms, setRhythms] = useState(null);
  const [consent, setConsent] = useState({ share_wellness_with_mentor: false, share_reflections_with_mentor: false, share_habits_with_mentor: false });
  const [range, setRange] = useState(30);

  const load = () => {
    api.get("/wellness/habits").then(({ data }) => { setHabits(data.items); setPresets(data.presets); });
    api.get("/wellness/journal").then(({ data }) => setJournal(data.items));
    api.get(`/wellness/rhythms?days=${range}`).then(({ data }) => setRhythms(data));
    api.get("/consent").then(({ data }) => setConsent({
      share_wellness_with_mentor: !!data.share_wellness_with_mentor,
      share_reflections_with_mentor: !!data.share_reflections_with_mentor,
      share_habits_with_mentor: !!data.share_habits_with_mentor,
    }));
  };
  useEffect(() => { load(); }, [range]);

  const addHabit = async (title) => {
    const t = title?.trim() || newHabit.trim();
    if (!t) return;
    try { await api.post("/wellness/habits", { title: t, cadence: "daily" }); setNewHabit(""); load(); toast.success("Habit added"); }
    catch { toast.error("Couldn't add"); }
  };

  const logHabit = async (id) => {
    try { await api.post("/wellness/habits/log", { habit_id: id }); load(); } catch { toast.error("Couldn't log"); }
  };

  const removeHabit = async (id) => {
    if (!window.confirm("Remove this habit and its logs?")) return;
    await api.delete(`/wellness/habits/${id}`); load();
  };

  const addJournal = async () => {
    if (!entry.trim()) return;
    try { await api.post("/wellness/journal", { body: entry, mood }); setEntry(""); load(); toast.success("Entry saved"); }
    catch { toast.error("Couldn't save"); }
  };

  const delJournal = async (id) => {
    await api.delete(`/wellness/journal/${id}`); load();
  };

  const updateConsent = async (patch) => {
    const next = { ...consent, ...patch };
    setConsent(next);
    try { await api.put("/consent", next); toast.success("Privacy setting updated"); }
    catch { toast.error("Couldn't update"); }
  };

  const rhythmsWithDay = (rhythms?.series || []).map((d) => ({ ...d, day: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }));

  return (
    <div className="fade-up" data-testid="wellness-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Activity className="w-3.5 h-3.5" /> My Wellness
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            The long, gentle <span className="viearta-gradient">shape of your care.</span>
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">Small habits, a private journal, and observations across your rhythm.</p>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-display text-2xl">Habits</h2>
          <div className="flex items-center gap-2">
            <input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="New habit…" data-testid="habit-input"
              className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm placeholder:text-white/30 outline-none" />
            <button onClick={() => addHabit()} data-testid="habit-add"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm bg-white text-black hover:bg-white/90"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>

        {presets.length > 0 && habits.length < 4 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.filter((p) => !habits.find((h) => h.title.toLowerCase() === p.title.toLowerCase())).map((p) => (
              <button key={p.key} onClick={() => addHabit(p.title)} data-testid={`habit-preset-${p.key}`}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white/85 hover:border-white/30">+ {p.title}</button>
            ))}
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-white/50 text-sm py-6 text-center border border-dashed border-white/10 rounded-2xl">
            No habits yet. Choose a preset above or add your own.
          </div>
        ) : (
          <ul className="space-y-2" data-testid="habits-list">
            {habits.map((h) => (
              <li key={h.id} data-testid={`habit-${h.id}`} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center gap-3">
                <button onClick={() => logHabit(h.id)} data-testid={`habit-log-${h.id}`}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${h.completed_today ? "bg-viearta-teal/20 border-viearta-teal/50" : "border-white/15 hover:border-white/30"}`}
                  title={h.completed_today ? "Logged today — tap to undo" : "Log today"}>
                  {h.completed_today ? "✓" : "○"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/90 truncate">{h.title}</div>
                  <div className="text-[11px] text-white/50">{h.cadence} · streak {h.streak}</div>
                </div>
                <div className="flex gap-0.5">
                  {h.last_14.map((on, i) => (
                    <div key={i} className={`w-1.5 h-5 rounded-sm ${on ? "bg-viearta-teal/70" : "bg-white/[0.08]"}`} />
                  ))}
                </div>
                <button onClick={() => removeHabit(h.id)} className="text-white/40 hover:text-white/80"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-display text-2xl inline-flex items-center gap-2"><BookText className="w-5 h-5 text-viearta-teal" /> Private journal</h2>
        </div>
        <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="A quick note about today"
          data-testid="journal-body" rows={3}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-white/30" />
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Mood</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setMood(n)} data-testid={`journal-mood-${n}`}
                className={`w-8 h-8 rounded-full text-xs border ${mood === n ? "bg-white/10 border-white/40" : "border-white/10 text-white/50 hover:text-white/85"}`}>{n}</button>
            ))}
          </div>
          <button onClick={addJournal} data-testid="journal-save"
            className="rounded-full px-5 py-2 text-sm bg-white text-black hover:bg-white/90">Save entry</button>
        </div>

        {journal.length > 0 && (
          <ul className="mt-5 space-y-2" data-testid="journal-list">
            {journal.slice(0, 6).map((j) => (
              <li key={j.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/45">{j.date} · mood {j.mood ?? "–"}</div>
                  <div className="text-sm text-white/85 mt-1 whitespace-pre-line">{j.body}</div>
                </div>
                <button onClick={() => delJournal(j.id)} className="text-white/40 hover:text-white/80"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-display text-2xl">Rhythms</h2>
          <div className="flex gap-2">
            {[7, 30, 90].map((r) => (
              <button key={r} onClick={() => setRange(r)} data-testid={`range-${r}`}
                className={`px-3 py-1.5 rounded-full text-xs border ${range === r ? "bg-white/10 border-white/40" : "border-white/10 text-white/55 hover:text-white/85"}`}>{r} days</button>
            ))}
          </div>
        </div>
        <div className="h-64" style={{ minHeight: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rhythmsWithDay} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wg-energy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.45} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="wg-sleep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9333EA" stopOpacity={0.4} /><stop offset="100%" stopColor="#9333EA" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="wg-stress" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E11D48" stopOpacity={0.4} /><stop offset="100%" stopColor="#E11D48" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="energy" name="Energy" stroke="#14B8A6" strokeWidth={2} fill="url(#wg-energy)" connectNulls />
              <Area type="monotone" dataKey="sleep" name="Sleep" stroke="#9333EA" strokeWidth={2} fill="url(#wg-sleep)" connectNulls />
              <Area type="monotone" dataKey="stress" name="Stress" stroke="#E11D48" strokeWidth={2} fill="url(#wg-stress)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {rhythms?.observations?.length > 0 && (
          <div className="mt-4 space-y-2">
            {rhythms.observations.map((o, i) => (
              <div key={i} className="text-sm text-white/75 inline-flex items-start gap-2"><Info className="w-4 h-4 text-viearta-teal mt-0.5 shrink-0" /> {o}</div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl inline-flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-viearta-teal" /> Privacy & consent</h2>
        <p className="text-white/60 text-sm max-w-2xl mb-4">All lifestyle data is private by default. Faculty and mentors only see what you explicitly consent to share.</p>
        {[
          ["share_wellness_with_mentor", "Share my weekly wellness patterns with a mentor"],
          ["share_reflections_with_mentor", "Share my private reflections with a mentor"],
          ["share_habits_with_mentor", "Share my habit progress with a mentor"],
        ].map(([key, label]) => (
          <label key={key} data-testid={`consent-${key}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 mb-2 cursor-pointer">
            <span className="text-sm text-white/85">{label}</span>
            <input type="checkbox" checked={!!consent[key]} onChange={(e) => updateConsent({ [key]: e.target.checked })} className="w-4 h-4 accent-teal-400" />
          </label>
        ))}
      </section>
    </div>
  );
}
