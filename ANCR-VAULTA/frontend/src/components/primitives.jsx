import { formatMoney, formatCompactMoney } from "@/lib/api";

export function GlassCard({ children, className = "", hover = false, testid }) {
  return (
    <div
      data-testid={testid}
      className={`glass p-6 ${hover ? "glass-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function KPICard({ label, value, sub, accent = "blue", trend, testid, compact = false }) {
  const accentBar = {
    blue:   "bg-cyan-400",
    violet: "bg-violet-400",
    orange: "bg-orange-400",
    green:  "bg-emerald-400",
    grad:   "gradient-bar",
  }[accent] || "bg-cyan-400";

  const formatted = typeof value === "number"
    ? (compact ? formatCompactMoney(value) : formatMoney(value))
    : value;

  return (
    <div className="glass glass-hover p-5 relative overflow-hidden" data-testid={testid}>
      <div className={`absolute top-0 left-0 h-[2px] w-10 ${accentBar}`} />
      <div className="eyebrow mb-3">{label}</div>
      <div className="kpi-value text-[28px] leading-none mb-1">{formatted}</div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`text-[11px] font-medium ${trend.startsWith("+") ? "text-emerald-400" : "text-orange-400"}`}>
            {trend}
          </span>
        )}
        {sub && <span className="text-[11px] text-white/45">{sub}</span>}
      </div>
    </div>
  );
}

export function SectionHeader({ title, kicker, action, className = "" }) {
  return (
    <div className={`flex items-end justify-between mb-5 ${className}`}>
      <div>
        {kicker && <div className="eyebrow mb-2">{kicker}</div>}
        <h2 className="font-display text-[26px] leading-tight tracking-tight text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, kicker, right }) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6">
      <div className="fade-up">
        {kicker && <div className="eyebrow mb-3">{kicker}</div>}
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-white leading-[1.02]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[13px] text-white/50 max-w-2xl">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Pill({ children, tone = "neutral", className = "" }) {
  return <span className={`pill pill-${tone} ${className}`}>{children}</span>;
}

export function StatusPill({ status }) {
  const map = {
    Paid: "success", Signed: "success", Active: "success", Connected: "success", Released: "success",
    Registered: "success", Received: "success", Issued: "success", Live: "success",
    Pending: "warning", "Pending Signature": "warning", "In Prep": "warning", Upcoming: "info",
    Late: "danger", Overdue: "danger", Draft: "neutral", Recurring: "info", Unreleased: "neutral",
    Recommended: "violet", Open: "info", "Long shot": "neutral",
  };
  return <Pill tone={map[status] || "neutral"}>{status}</Pill>;
}
