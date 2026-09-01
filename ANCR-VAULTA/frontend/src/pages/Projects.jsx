import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatMoney, formatCompactMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { Route, ArrowRight, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";

const TYPE_TONE = {
  Tour:     "text-cyan-400",
  Album:    "text-violet-400",
  EP:       "text-violet-400",
  Single:   "text-violet-400",
  Film:     "text-orange-400",
  Festival: "text-pink-400",
  "Writing Camp": "text-yellow-400",
  Conference:"text-emerald-400",
  Workshop: "text-blue-400",
  Residency:"text-fuchsia-400",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
  }, []);

  const totalRev = projects.reduce((a, b) => a + b.total_revenue, 0);
  const totalExp = projects.reduce((a, b) => a + b.total_expense, 0);
  const totalNet = totalRev - totalExp;
  const avgMargin = projects.length ? projects.reduce((a, b) => a + b.profit_margin, 0) / projects.length : 0;

  return (
    <div className="space-y-8" data-testid="projects-page">
      <PageHeader
        kicker="Tour Profitability & Project P&L™"
        title={<>Executive financial models for <span className="gradient-text">every creative project.</span></>}
        subtitle="Tours · Albums · EPs · Films · Festivals · Writing Camps · Residencies. Full P&L with revenue projections, expense modeling, cash flow timeline, break-even analysis, and AI risk assessment."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Projected Revenue" value={totalRev} accent="grad" compact testid="projects-kpi-revenue" />
        <KPICard label="Total Expenses" value={totalExp} accent="orange" compact />
        <KPICard label="Combined Net Profit" value={totalNet} accent="green" compact testid="projects-kpi-net" />
        <KPICard label="Avg Profit Margin" value={`${avgMargin.toFixed(1)}%`} accent="violet" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" data-testid="projects-list">
        {projects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} data-testid={`project-card-${p.id}`}>
            <GlassCard hover className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-[3px] w-24 ${(TYPE_TONE[p.type] || 'text-white').replace('text-','bg-')}`} />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Route size={14} className={TYPE_TONE[p.type] || 'text-white'} />
                  <div className={`text-[10px] tracking-[0.22em] uppercase font-semibold ${TYPE_TONE[p.type] || 'text-white'}`}>
                    {p.type}
                  </div>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="font-display text-2xl leading-tight mb-1">{p.name}</div>
              <div className="text-[11.5px] text-white/50 mb-4">
                {p.location} · {p.start_date && formatDate(p.start_date)} → {p.end_date && formatDate(p.end_date)}
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <div className="eyebrow">Revenue</div>
                  <div className="text-[15px] font-medium mt-0.5 text-white">{formatCompactMoney(p.total_revenue)}</div>
                </div>
                <div>
                  <div className="eyebrow">Expenses</div>
                  <div className="text-[15px] font-medium mt-0.5 text-orange-400">{formatCompactMoney(p.total_expense)}</div>
                </div>
                <div>
                  <div className="eyebrow">Net</div>
                  <div className="text-[15px] font-medium mt-0.5 text-emerald-400">{formatCompactMoney(p.net_profit)}</div>
                </div>
                <div>
                  <div className="eyebrow">Margin</div>
                  <div className="text-[15px] font-medium mt-0.5 text-cyan-400">{p.profit_margin}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
                <div>
                  <div className="eyebrow mb-2">Health Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className={`h-full ${p.health_score >= 75 ? "bg-emerald-400" : p.health_score >= 60 ? "gradient-bar" : "bg-orange-400"}`} style={{ width: `${p.health_score}%` }} />
                    </div>
                    <div className="text-[12px] font-medium font-mono-tab">{p.health_score}</div>
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-2">ROI</div>
                  <div className="text-[14px] font-medium text-white">{p.roi}%</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end text-[11.5px] text-white/50">
                Open P&L Terminal <ArrowRight size={11} className="ml-1" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
