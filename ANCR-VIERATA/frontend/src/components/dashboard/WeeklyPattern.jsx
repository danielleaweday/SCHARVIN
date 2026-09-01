import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const METRICS = [
  { key: "energy", label: "Energy", color: "#14B8A6" },
  { key: "stress", label: "Stress", color: "#E11D48" },
  { key: "sleep", label: "Sleep (h)", color: "#9333EA" },
  { key: "discomfort", label: "Discomfort", color: "#EA580C" },
  { key: "creative_workload", label: "Creative load", color: "#D97706" },
];

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-2xl border border-white/15 bg-[#0a0a0a]/90 backdrop-blur-xl px-3 py-2 text-xs font-sans">
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

export function WeeklyPattern({ refreshKey }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(["energy", "stress", "sleep"]);

  useEffect(() => {
    let alive = true;
    api.get("/checkins/week")
      .then(({ data }) => {
        if (!alive) return;
        setSeries((data.series || []).map((d) => ({
          ...d,
          day: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
        })));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <section data-testid="weekly-pattern" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Weekly pattern</h2>
          <p className="text-white/55 mt-1 text-sm">A gentle look at how the last seven days have moved.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => {
            const on = active.includes(m.key);
            return (
              <button
                key={m.key}
                data-testid={`metric-toggle-${m.key}`}
                onClick={() =>
                  setActive((prev) =>
                    prev.includes(m.key) ? prev.filter((k) => k !== m.key) : [...prev, m.key]
                  )
                }
                className={`px-3 py-1.5 rounded-full text-[11px] font-sans border transition-all ${
                  on ? "border-white/40 text-white bg-white/5" : "border-white/10 text-white/45 hover:text-white/75"
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: m.color }} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-72 w-full" style={{ minHeight: 260 }}>
        {loading ? (
          <div className="text-white/50 text-sm">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <defs>
                {METRICS.map((m) => (
                  <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={m.color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={m.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ display: "none" }} />
              {METRICS.filter((m) => active.includes(m.key)).map((m) => (
                <Area
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  fill={`url(#grad-${m.key})`}
                  connectNulls
                  dot={{ r: 2, stroke: m.color, fill: "#050505" }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/35">
        Observational — not a grade.
      </p>
    </section>
  );
}
