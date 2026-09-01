export default function GlassCard({ children, className = "", testid, ...rest }) {
  return (
    <div
      data-testid={testid}
      className={`glass rounded-3xl p-6 md:p-7 hover-lift ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, right, testid }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6" data-testid={testid}>
      <div>
        {eyebrow && (
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">{eyebrow}</div>
        )}
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-white mt-1">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, mono = true }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">{label}</div>
      <div className={`${mono ? "font-mono" : "font-display"} text-white text-lg`}>{value}</div>
    </div>
  );
}

export function ScoreDial({ label, value, tint = "#00e5ff" }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-4">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="60%" stopColor="#8a2be2" />
            <stop offset="100%" stopColor="#ff6d00" />
          </linearGradient>
        </defs>
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke={`url(#g-${label})`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">{label}</div>
        <div className="font-display text-2xl text-white mt-0.5">{value}<span className="text-white/40 text-sm">/100</span></div>
      </div>
    </div>
  );
}
