import React from "react";

/**
 * MacroRings — non-competitive progress rendering.
 * No red "failure" state. Under-target uses neutral gradient; over-target still shows warmly.
 */
export function MacroRing({ label, value, target, unit = "g", color = "#14B8A6", size = 96, testid }) {
  const pct = Math.min(1, (value || 0) / Math.max(target || 1, 1));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  return (
    <div data-testid={testid} className="flex flex-col items-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="-mt-[calc(50%+8px)] text-center relative" style={{ marginTop: -size / 2 - 8 }}>
        <div className="font-display text-lg leading-none">{Math.round(value || 0)}<span className="text-white/40 text-xs">/{target}</span></div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{label}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ label, value, target, unit = "", color = "#14B8A6", testid }) {
  const pct = Math.min(1, (value || 0) / Math.max(target || 1, 1));
  return (
    <div data-testid={testid} className="w-full">
      <div className="flex items-baseline justify-between text-xs text-white/60 mb-1.5">
        <span className="uppercase tracking-[0.2em]">{label}</span>
        <span className="font-mono text-white/70">{Math.round(value || 0)}{unit} <span className="text-white/35">/ {target}{unit}</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color, transition: "width 700ms ease" }} />
      </div>
    </div>
  );
}
