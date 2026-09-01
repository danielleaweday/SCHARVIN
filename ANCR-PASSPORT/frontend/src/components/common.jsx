import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const PageHeader = ({ eyebrow, title, subtitle, action, testid }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8" data-testid={testid}>
    <div>
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.28em] text-cyan mb-3 font-sans font-600">{eyebrow}</div>
      )}
      <h1 className="font-display text-4xl sm:text-5xl font-700 tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground text-base leading-relaxed">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const GlassCard = ({ children, className, hover = false, ...rest }) => (
  <div className={cn("glass rounded-2xl", hover && "glass-hover", className)} {...rest}>
    {children}
  </div>
);

export const Disclaimer = ({ text, className }) => (
  <div
    className={cn("flex items-start gap-2.5 rounded-xl border border-amber/25 bg-amber/5 px-4 py-3 text-xs leading-relaxed text-amber/90", className)}
    data-testid="disclaimer-notice"
  >
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.6} />
    <span>{text}</span>
  </div>
);

export const Ring = ({ value, size = 88, stroke = 8, label, sub }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringgrad)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono-p text-lg font-600 text-white">{value}%</span>
        {sub && <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
};

export const Bar = ({ value, label }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono-p text-white/80">{value}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg,#22d3ee,#8b5cf6,#d946ef)" }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  </div>
);

export const Loader = ({ label = "Loading" }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground" data-testid="loader">
    <div className="soundwave flex h-8 items-end">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ height: 26, animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
    <span className="text-sm">{label}…</span>
  </div>
);

export const Pill = ({ children, tone = "cyan", className }) => {
  const tones = {
    cyan: "bg-cyan/12 text-cyan border border-cyan/25",
    violet: "bg-violet/12 text-violet border border-violet/25",
    amber: "bg-amber/12 text-amber border border-amber/25",
    magenta: "bg-magenta/12 text-magenta border border-magenta/25",
    muted: "bg-white/6 text-white/60 border border-white/10",
    green: "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25",
  };
  return <span className={cn("pill", tones[tone], className)}>{children}</span>;
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
