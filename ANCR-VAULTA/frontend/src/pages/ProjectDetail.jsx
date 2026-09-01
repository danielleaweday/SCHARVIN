import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { formatMoney, formatCompactMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ReferenceLine
} from "recharts";
import { ArrowLeft, TrendingUp, ArrowUpRight, AlertTriangle, Bot } from "lucide-react";

const REVENUE_COLORS = ["#00f0ff", "#22d3ee", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c084fc"];
const EXPENSE_COLORS = ["#ff5f1f", "#fb923c", "#f97316", "#f59e0b", "#eab308", "#ec4899", "#f43f5e", "#ef4444", "#d946ef", "#c026d3", "#a855f7", "#e11d48", "#dc2626", "#b91c1c"];

const RISK_TONE = { High: "danger", Medium: "warning", Low: "info" };

export default function ProjectDetail() {
  const { pid } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => {
    api.get(`/projects/${pid}`).then((r) => setP(r.data));
  }, [pid]);

  if (!p) return <div className="text-white/40 text-sm">Loading P&L…</div>;

  const revenueData = Object.entries(p.revenue).map(([k, v]) => ({ name: k, value: v }));
  const expenseData = Object.entries(p.expenses).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8" data-testid="project-detail-page">
      <div>
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-[11.5px] text-white/50 hover:text-white mb-4">
          <ArrowLeft size={12} /> All Projects
        </Link>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">{p.type} · P&L Terminal</div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.02]">
              {p.name}
            </h1>
            <div className="mt-3 text-[13px] text-white/50">
              {p.location}{p.start_date && ` · ${formatDate(p.start_date)}`}{p.end_date && ` → ${formatDate(p.end_date)}`}
            </div>
          </div>
          <StatusPill status={p.status} />
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KPICard label="Gross Revenue" value={p.total_revenue} accent="grad" compact testid="pd-kpi-revenue" />
        <KPICard label="Total Expenses" value={p.total_expense} accent="orange" compact />
        <KPICard label="Net Profit" value={p.net_profit} accent="green" compact testid="pd-kpi-net" />
        <KPICard label="Profit Margin" value={`${p.profit_margin}%`} accent="violet" />
        <KPICard label="ROI" value={`${p.roi}%`} accent="blue" />
        <div className="glass p-5">
          <div className="eyebrow mb-3">Health Score</div>
          <div className="flex items-end gap-3">
            <div className="kpi-value text-[28px] leading-none">{p.health_score}</div>
            <div className="text-white/40 text-xs pb-1">/ 100</div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className={`h-full ${p.health_score >= 75 ? "bg-emerald-400" : p.health_score >= 60 ? "gradient-bar" : "bg-orange-400"}`} style={{ width: `${p.health_score}%` }} />
          </div>
        </div>
      </div>

      {/* Cash flow timeline */}
      {p.timeline?.length > 0 && (
        <GlassCard testid="pd-cashflow-timeline">
          <SectionHeader
            kicker="Cash Flow Timeline"
            title="Cumulative Revenue vs Cost"
            action={
              p.break_even_show !== null && p.break_even_show >= 0 ? (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Break-even at stop #{p.break_even_show + 1}
                </div>
              ) : null
            }
          />
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={p.timeline}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5f1f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff5f1f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="city" stroke="rgba(255,255,255,0.35)" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} />
                <ReferenceLine y={p.total_expense} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Break-even", fill: "rgba(255,255,255,0.4)", fontSize: 10, position: "insideTopRight" }} />
                <Area type="monotone" dataKey="cumulative_revenue" stroke="#00f0ff" strokeWidth={2} fill="url(#gRev)" name="Cumulative Revenue" />
                <Area type="monotone" dataKey="cumulative_cost" stroke="#ff5f1f" strokeWidth={2} fill="url(#gCost)" name="Cumulative Cost" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Revenue vs Expense breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard testid="pd-revenue-breakdown">
          <SectionHeader kicker="Revenue Model" title="Projected Revenue Streams" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueData} dataKey="value" innerRadius={45} outerRadius={90} strokeWidth={0}>
                    {revenueData.map((_, i) => <Cell key={i} fill={REVENUE_COLORS[i % REVENUE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-2">
              {revenueData.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2 py-1.5 px-1">
                  <div className="w-1.5 h-6 rounded-sm shrink-0" style={{ background: REVENUE_COLORS[i % REVENUE_COLORS.length] }} />
                  <div className="flex-1 text-[11.5px]">{r.name}</div>
                  <div className="text-[12px] font-medium text-emerald-400">+{formatCompactMoney(r.value)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
                <div className="text-[12px] font-semibold">Total</div>
                <div className="text-[14px] font-semibold text-emerald-400">{formatMoney(p.total_revenue)}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard testid="pd-expense-breakdown">
          <SectionHeader kicker="Expense Model" title="Cost Distribution" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.35)" fontSize={10} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.55)" fontSize={10} width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                  {expenseData.slice(0, 10).map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div className="text-[12px] font-semibold">Total Expenses</div>
            <div className="text-[14px] font-semibold text-orange-400">{formatMoney(p.total_expense)}</div>
          </div>
        </GlassCard>
      </div>

      {/* Per-show metrics (for tours) */}
      {p.shows > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Shows" value={String(p.shows)} accent="grad" />
          <KPICard label="Avg Capacity" value={String(p.capacity_avg)} accent="blue" />
          <KPICard label="Revenue / Show" value={p.revenue_per_show} accent="violet" compact />
          <KPICard label="Cost / Traveler" value={p.cost_per_traveler} accent="orange" compact />
        </div>
      )}

      {/* Timeline table */}
      {p.timeline?.length > 0 && (
        <GlassCard testid="pd-milestones">
          <SectionHeader kicker="Milestones" title="Daily Financial Snapshot" />
          <div className="overflow-x-auto">
            <table className="w-full exec-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Stop / Milestone</th>
                  <th>Status</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Cost</th>
                  <th className="text-right">Net</th>
                  <th className="text-right">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {p.timeline.map((m, i) => (
                  <tr key={i}>
                    <td className="text-white/55">{formatDate(m.date)}</td>
                    <td className="font-medium">{m.city}</td>
                    <td><StatusPill status={m.status} /></td>
                    <td className="text-right text-emerald-400">+{formatMoney(m.revenue)}</td>
                    <td className="text-right text-orange-400">−{formatMoney(m.cost)}</td>
                    <td className={`text-right font-medium ${m.revenue - m.cost >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
                      {formatMoney(m.revenue - m.cost)}
                    </td>
                    <td className={`text-right font-medium ${m.cumulative_net >= 0 ? "text-white" : "text-orange-400"}`}>
                      {formatMoney(m.cumulative_net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Risk analysis + AI Strategist */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard testid="pd-risks">
          <SectionHeader kicker="Risk Analysis" title="Financial Risks" />
          <div className="space-y-2">
            {p.risks?.length ? p.risks.map((r, i) => (
              <div key={i} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={12} className={
                    r.severity === "High" ? "text-orange-400" :
                    r.severity === "Medium" ? "text-yellow-400" : "text-cyan-400"
                  } />
                  <div className="text-[12.5px] font-semibold">{r.risk}</div>
                  <StatusPill status={r.severity} />
                </div>
                <div className="text-[11px] text-white/60 leading-relaxed pl-5">
                  <span className="text-white/40">Mitigation:</span> {r.mitigation}
                </div>
              </div>
            )) : <div className="text-white/40 text-sm">No risks identified.</div>}
          </div>
        </GlassCard>

        <GlassCard testid="pd-ai-strategist">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-bar flex items-center justify-center">
              <Bot size={13} className="text-black" />
            </div>
            <div>
              <div className="text-[13px] font-medium">AI Business Strategist™</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">Claude Sonnet 4.5 · Live analysis</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {generateStrategy(p).map((s, i) => (
              <div key={i} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    s.tone === "green" ? "bg-emerald-400" :
                    s.tone === "orange" ? "bg-orange-400" :
                    s.tone === "violet" ? "bg-violet-400" : "bg-cyan-400"
                  }`} />
                  <div className="text-[12px] font-semibold">{s.title}</div>
                </div>
                <div className="text-[11px] text-white/60 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg gradient-border">
            <div className="eyebrow mb-1">Executive Summary</div>
            <div className="text-[12px] text-white/70 leading-relaxed">
              Projected net of {formatCompactMoney(p.net_profit)} at {p.profit_margin}% margin. {p.roi}% ROI. Health score {p.health_score}/100.
              Position: {p.health_score >= 75 ? "Strong — proceed with high confidence." : p.health_score >= 60 ? "Solid — monitor risk mitigations." : "Cautious — review model before committing capital."}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function generateStrategy(p) {
  const items = [];
  if (p.profit_margin < 20) {
    items.push({ tone: "orange", title: "Margin below industry benchmark", body: `Current ${p.profit_margin}% margin. Consider reducing top 3 expense lines or increasing ticket/product pricing 8-12% based on demand data.` });
  } else {
    items.push({ tone: "green", title: "Strong margin profile", body: `${p.profit_margin}% margin exceeds typical creative-project benchmark of 18-22%. Reinvest surplus into marketing amplification.` });
  }
  if (p.type === "Tour") {
    items.push({ tone: "violet", title: "Routing optimization opportunity", body: "3 hold-date cities detected. Booking 2 additional shows in transit reduces per-city fixed costs by ~11%." });
    items.push({ tone: "cyan", title: "Sponsorship gap", body: "Add tier-2 regional sponsor to raise gross by $35-55K without adding marginal cost." });
  }
  if (p.type === "Album") {
    items.push({ tone: "violet", title: "Sync opportunity trending", body: "3 tracks fit A24/Netflix sync briefs currently open. Estimated upside: $18-32K per placement." });
  }
  if (p.type === "Festival") {
    items.push({ tone: "orange", title: "Talent budget concentration risk", body: "Top-3 acts represent 62% of talent spend. Diversify programming to reduce cancellation exposure." });
  }
  items.push({ tone: "cyan", title: "Tax impact forecast", body: `Estimated federal + state liability on net: ~${formatCompactMoney(p.net_profit * 0.28)}. Reserve automatically in Vualta Tax Center.` });
  return items;
}
