import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { ArrowLeft, Utensils, Heart, Activity, Droplets, Bookmark } from "lucide-react";

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

function Stat({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 mb-3" style={{ background: `${color}18`, color }}>
        <Icon className="w-4 h-4" strokeWidth={1.7} />
      </div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className="font-display text-2xl mt-0.5">{value}<span className="text-white/40 text-sm ml-1">{unit}</span></div>
    </div>
  );
}

export default function MyProgress() {
  const navigate = useNavigate();
  const [week, setWeek] = useState([]);
  const [summary, setSummary] = useState(null);
  const [checkinRaw, setCheckinRaw] = useState([]);

  useEffect(() => {
    api.get("/checkins/week").then(({ data }) => { setWeek(data.series); setCheckinRaw(data.raw); });
    api.get("/lifestyle/summary").then(({ data }) => setSummary(data));
  }, []);

  // Merge wellness + lifestyle series by date
  const merged = week.map((w) => {
    const life = summary?.series.find((s) => s.date === w.date) || {};
    return { ...w, kcal: life.kcal || 0, protein: life.protein || 0, water_ml: life.water_ml || 0, day: new Date(w.date).toLocaleDateString(undefined, { weekday: "short" }) };
  });

  return (
    <div className="fade-up" data-testid="progress-page">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <h1 className="font-display text-4xl tracking-tight">My progress</h1>
          <p className="text-white/60 text-sm mt-2 max-w-2xl">A long, gentle view of your rhythm. These are observations — not proven causes, and not a score.</p>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={Utensils} label="Meals logged" value={summary?.series.reduce((a, s) => a + (s.kcal > 0 ? 1 : 0), 0) || 0} unit="days" color="#EA580C" />
        <Stat icon={Droplets} label="Avg hydration" value={summary ? Math.round(summary.series.reduce((a, s) => a + s.water_ml, 0) / 7) : 0} unit="ml/day" color="#14B8A6" />
        <Stat icon={Heart} label="Mindfulness" value={summary?.mindfulness_sessions || 0} unit="sessions" color="#9333EA" />
        <Stat icon={Activity} label="Movement" value={summary?.movement_minutes || 0} unit="min" color="#D97706" />
      </div>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl tracking-tight mb-4">Weekly wellness & nutrition</h2>
        <div className="h-64" style={{ minHeight: 240 }}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={merged} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g-energy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.5} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="g-kcal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EA580C" stopOpacity={0.4} /><stop offset="100%" stopColor="#EA580C" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9333EA" stopOpacity={0.4} /><stop offset="100%" stopColor="#9333EA" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="energy" name="Energy" stroke="#14B8A6" strokeWidth={2} fill="url(#g-energy)" connectNulls />
              <Area type="monotone" dataKey="kcal" name="Calories" stroke="#EA580C" strokeWidth={2} fill="url(#g-kcal)" />
              <Area type="monotone" dataKey="water_ml" name="Water (ml)" stroke="#9333EA" strokeWidth={2} fill="url(#g-water)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl tracking-tight mb-4">Macro pattern</h2>
        <div className="h-56" style={{ minHeight: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={merged} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="protein" name="Protein" fill="#9333EA" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/35">Observational — not a proven cause of any outcome.</p>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl tracking-tight mb-3 inline-flex items-center gap-2"><Bookmark className="w-5 h-5 text-viearta-teal" /> Private lifestyle notes</h2>
        <p className="text-white/55 text-sm">You have <span className="text-white/85 font-mono">{summary?.affirmations_saved ?? 0}</span> saved affirmations and reflections. Only you can see them.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => navigate("/lifestyle/mindfulness")} className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Open Mindfulness</button>
          <button onClick={() => navigate("/lifestyle/nutrition")} className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Open Nutrition</button>
          <button onClick={() => navigate("/lifestyle/movement")} className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Open Movement</button>
        </div>
      </section>
    </div>
  );
}
