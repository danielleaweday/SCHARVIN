import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, Sparkles, Waves, LifeBuoy, Users, LineChart } from "lucide-react";

const ACTIONS = [
  { key: "check-in", label: "Check in now", icon: HeartPulse, to: "/check-in", color: "#14B8A6" },
  { key: "prep", label: "Prepare for a performance", icon: Sparkles, to: "/performance", color: "#9333EA" },
  { key: "recovery", label: "Start a recovery session", icon: Waves, to: "/recovery", color: "#EA580C" },
  { key: "support", label: "Ask for support", icon: LifeBuoy, to: "/support", color: "#E11D48" },
  { key: "circle", label: "Join Wellness Circle", icon: Users, to: "/circle", color: "#D97706" },
  { key: "progress", label: "View my progress", icon: LineChart, to: "/progress", color: "#14B8A6" },
];

export function QuickAccess() {
  const navigate = useNavigate();
  return (
    <section data-testid="quick-access" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover">
      <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-4">Quick access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              data-testid={`quick-${a.key}`}
              onClick={() => navigate(a.to)}
              className="text-left rounded-2xl p-4 border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 mb-3 group-hover:scale-105 transition-transform"
                style={{ background: `${a.color}18`, color: a.color }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.7} />
              </div>
              <div className="font-sans text-sm text-white/90">{a.label}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
