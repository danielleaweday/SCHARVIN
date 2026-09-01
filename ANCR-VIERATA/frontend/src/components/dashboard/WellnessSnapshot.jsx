import React from "react";
import { Battery, Moon, Droplets, Wind, HeartPulse, Smile, Mic, Ear, CalendarClock } from "lucide-react";

const scaleLabels = ["Very low", "Low", "Steady", "Good", "Excellent"];

function Stat({ label, value, hint, icon: Icon, color }) {
  return (
    <div className="rounded-2xl p-4 border border-white/[0.07] bg-white/[0.02] flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 shrink-0"
        style={{ background: `${color}18`, color }}
      >
        <Icon className="w-4 h-4" strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</div>
        <div className="font-display text-xl mt-0.5 truncate">{value}</div>
        {hint && <div className="text-xs text-white/45 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export function WellnessSnapshot({ checkin }) {
  const s = checkin?.snapshot;

  return (
    <section data-testid="wellness-snapshot" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <div className="mb-5">
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Today's wellness snapshot</h2>
        <p className="text-white/55 mt-1 text-sm">Your current rhythm — a personal snapshot, not a grade.</p>
      </div>

      {!s ? (
        <div className="text-white/55 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">
          Save your arrival above to see today's snapshot.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat label="Energy" value={scaleLabels[s.energy_level - 1]} icon={Battery} color="#14B8A6" />
          <Stat label="Sleep" value={`${s.sleep_hours}h`} hint="Last night" icon={Moon} color="#9333EA" />
          <Stat label="Hydration" value={`${s.hydration_glasses} glasses`} icon={Droplets} color="#14B8A6" />
          <Stat label="Stress" value={scaleLabels[s.stress_level - 1]} icon={Wind} color="#EA580C" />
          <Stat label="Body" value={scaleLabels[5 - (s.body_discomfort - 1) - 1]} hint="Discomfort inverted" icon={HeartPulse} color="#E11D48" />
          <Stat label="Mood" value={scaleLabels[s.mood - 1]} icon={Smile} color="#D97706" />
          {s.voice_condition && <Stat label="Voice" value={scaleLabels[s.voice_condition - 1]} icon={Mic} color="#9333EA" />}
          {s.hearing_condition && <Stat label="Hearing" value={scaleLabels[s.hearing_condition - 1]} icon={Ear} color="#14B8A6" />}
          <Stat label="Creative workload" value={scaleLabels[s.creative_workload - 1]} icon={CalendarClock} color="#EA580C" />
        </div>
      )}
    </section>
  );
}
