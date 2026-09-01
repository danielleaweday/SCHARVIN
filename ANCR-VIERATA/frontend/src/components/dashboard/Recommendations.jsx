import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Mic, Ear, Waves, Droplets, Wind, Focus, Bed, Activity, Sparkles } from "lucide-react";

const ICONS = {
  vocal: Mic,
  hearing: Ear,
  posture: Activity,
  hydration: Droplets,
  breath: Wind,
  focus: Focus,
  recovery: Waves,
  sleep: Bed,
};

const COLORS = {
  vocal: "#9333EA",
  hearing: "#14B8A6",
  posture: "#EA580C",
  hydration: "#14B8A6",
  breath: "#9333EA",
  focus: "#D97706",
  recovery: "#14B8A6",
  sleep: "#9333EA",
};

export function Recommendations({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/recommendations");
        if (!alive) return;
        setItems(data.items || []);
        setPersonalized(data.personalized);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <section data-testid="recommendations" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Recommended for today</h2>
          <p className="text-white/55 mt-1 text-sm">
            {personalized
              ? "Shaped by your check-in and today's plan."
              : "Save your arrival to personalize these to your day."}
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 hidden sm:flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Rule-based
        </div>
      </div>

      {loading ? (
        <div className="text-white/50 text-sm">Preparing your recommendations…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((r) => {
            const Icon = ICONS[r.category] || Sparkles;
            const color = COLORS[r.category] || "#14B8A6";
            return (
              <div
                key={r.id}
                data-testid={`rec-${r.id}`}
                className="rounded-2xl p-4 border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.045] hover:border-white/15 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 mb-3"
                  style={{ background: `${color}18`, color }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.7} />
                </div>
                <div className="font-display text-lg leading-snug">{r.title}</div>
                <div className="text-white/60 text-sm mt-1 leading-relaxed">{r.body}</div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
                  {r.duration_minutes} min · {r.category}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
