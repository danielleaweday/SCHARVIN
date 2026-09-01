import React from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Heart, Activity, ArrowRight, BookOpen, ListVideo } from "lucide-react";

const SECTIONS = [
  {
    key: "nutrition", to: "/lifestyle/nutrition", icon: UtensilsCrossed, color: "#EA580C",
    title: "Nutrition", subtitle: "Fuel that supports your energy, focus and craft.",
    bullets: ["Log meals, macros and hydration", "Set educational targets", "Plan for performance days"],
  },
  {
    key: "mindfulness", to: "/lifestyle/mindfulness", icon: Heart, color: "#9333EA",
    title: "Mindfulness", subtitle: "A quiet space to reset, ground, and stay present.",
    bullets: ["Daily affirmations", "Two-to-ten minute practices", "Save reflections privately"],
  },
  {
    key: "movement", to: "/lifestyle/movement", icon: Activity, color: "#14B8A6",
    title: "Movement", subtitle: "Short, practical movement for creators.",
    bullets: ["Discipline-aware routines", "Timers for every activity", "Build your own routine"],
  },
  {
    key: "playlists", to: "/playlists", icon: ListVideo, color: "#D97706",
    title: "Playlists", subtitle: "Curated video collections from your VIEARTA program team.",
    bullets: ["Health workshops", "Guided sessions", "Exercise & recovery playlists"],
  },
];

export default function LifestyleHub() {
  const navigate = useNavigate();
  return (
    <div className="fade-up">
      <section className="glass rounded-3xl p-8 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/45 mb-3">Lifestyle</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Learn a principle. Live it. <span className="viearta-gradient">Notice the pattern.</span>
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">
            Lifestyle connects VIEARTA Learning to your daily practice — food, breath, and movement — so the ideas stay useful long after the lesson ends.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-white/50">
            <BookOpen className="w-3.5 h-3.5" /> Educational — not medical. Add professional care as you need it.
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="lifestyle-sections">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              data-testid={`lifestyle-${s.key}`}
              onClick={() => navigate(s.to)}
              className="text-left glass rounded-3xl p-6 glass-hover relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: s.color }} />
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center mb-4"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.7} />
                </div>
                <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
                <p className="text-white/60 text-sm mt-1">{s.subtitle}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-white/70">
                  {s.bullets.map((b) => <li key={b} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full mt-2" style={{ background: s.color }} /> {b}</li>)}
                </ul>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/70 group-hover:text-white transition-colors">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
