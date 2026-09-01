import React from "react";
import { ArrowUpRight } from "lucide-react";

/** Section header — for page titles. Consistent editorial + technical hybrid. */
export function Section({ eyebrow, title, sub, right, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        {eyebrow && <div className="ancr-label mb-2">{eyebrow}</div>}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-none tracking-tight">
          {title}
        </h2>
        {sub && <div className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ancr-dim">{sub}</div>}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}

/** Small key/value stat card for creation-mode dashboards. */
export function StatCell({ label, value, hint, accent, className = "" }) {
  return (
    <div className={`ancr-card p-5 ${className}`}>
      <div className="ancr-label">{label}</div>
      <div className={`mt-3 font-mono text-2xl tracking-tight ${accent ? "text-[var(--ancra-accent)]" : ""}`}>
        {value}
      </div>
      {hint && <div className="mt-1 font-mono text-[10px] text-ancr-mute">{hint}</div>}
    </div>
  );
}

/** Cinematic tile used for Studio Experiences™. */
export function ExperienceTile({ exp, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      data-testid={`experience-tile-${exp.id}`}
      className={`group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black text-left transition-all duration-500 hover:border-white/25 hover:-translate-y-[2px] ${className}`}
    >
      <img
        src={exp.cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[1200ms] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.22em] text-white/70 uppercase">
            {exp.tag}
          </div>
          <ArrowUpRight
            size={16}
            className="text-white/60 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white"
          />
        </div>
        <div>
          <div className="ancr-label mb-2 text-white/60">{exp.kind}</div>
          <div className="font-serif text-[26px] leading-[1.05] tracking-tight">
            {exp.title}
          </div>
          <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-white/70">
            <span>{exp.faculty}</span>
            <span className="ancr-dot" />
            <span>{exp.duration}</span>
          </div>
          {exp.progress !== undefined && (
            <div className="mt-4">
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${exp.progress}%` }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[10px] text-white/50">
                {exp.progress}% complete
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function Chip({ children, tone = "default" }) {
  const tones = {
    default: "border-white/10 text-ancr-dim bg-white/[0.02]",
    accent:  "border-[var(--ancra-accent)]/40 text-[var(--ancra-accent)] bg-[var(--ancra-accent)]/[0.06]",
    success: "border-emerald-500/25 text-emerald-300 bg-emerald-500/[0.06]",
    warn:    "border-amber-500/25 text-amber-300 bg-amber-500/[0.06]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ProgressRing({ value, size = 160, stroke = 3, label, sub }) {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="white"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-serif text-4xl leading-none tracking-tight">{value}%</div>
        {label && <div className="ancr-label mt-2">{label}</div>}
        {sub && <div className="mt-1 font-mono text-[10px] text-ancr-mute">{sub}</div>}
      </div>
    </div>
  );
}
