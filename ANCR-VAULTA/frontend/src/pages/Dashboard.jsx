import { useEffect, useState } from "react";
import api, { formatMoney, formatCompactMoney, formatDate } from "@/lib/api";
import { KPICard, PageHeader, GlassCard, SectionHeader, StatusPill } from "@/components/primitives";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard/overview").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="text-white/40 text-sm">Loading terminal…</div>;

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <PageHeader
        kicker="Overview · Vaulta Terminal"
        title={<>Your financial command center. <span className="gradient-text">Live.</span></>}
        subtitle="A single, executive view of every dollar, royalty, contract, invoice, and forecast across the ANCR ecosystem."
        right={
          <button
            onClick={() => navigate("/aiah")}
            data-testid="dashboard-open-aiah"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-strong hover:bg-white/[0.05] text-[12px] font-medium"
          >
            <Bot size={14} /> Ask AIAH
          </button>
        }
      />

      {/* Row 1: Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 fade-up">
        <KPICard testid="kpi-net-worth" label="Net Worth" value={data.net_worth} accent="grad" compact trend="+12.4%" sub="vs last quarter" />
        <KPICard testid="kpi-cash" label="Cash Available" value={data.cash_available} accent="blue" compact trend="+3.1%" sub="across 4 accounts" />
        <KPICard testid="kpi-monthly-revenue" label="Monthly Revenue" value={data.monthly_revenue} accent="violet" trend="+18%" sub="MTD" />
        <KPICard testid="kpi-projected" label="Projected Income" value={data.projected_income} accent="orange" sub="next 30 days" />
        <KPICard testid="kpi-outstanding" label="Outstanding Invoices" value={data.outstanding_invoices} accent="orange" sub="2 pending · 1 late" />
      </div>

      {/* Row 2: 2 more KPIs + health scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-up-delay-1">
        <KPICard testid="kpi-royalties" label="Royalties Pending" value={data.royalties_pending} accent="violet" sub="6 PROs" />
        <KPICard testid="kpi-publishing" label="Publishing Income" value={data.publishing_income} accent="blue" compact sub="YTD" />
        <div className="glass p-5">
          <div className="eyebrow mb-3">Business Health</div>
          <div className="flex items-end gap-3">
            <div className="kpi-value text-[36px] leading-none">{data.business_health_score}</div>
            <div className="text-white/40 text-xs pb-1">/ 100</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full gradient-bar" style={{ width: `${data.business_health_score}%` }} />
          </div>
          <div className="mt-2 text-[10px] tracking-[0.22em] uppercase text-emerald-400">Excellent</div>
        </div>
        <div className="glass p-5">
          <div className="eyebrow mb-3">Tax Readiness</div>
          <div className="flex items-end gap-3">
            <div className="kpi-value text-[36px] leading-none">{data.tax_readiness}</div>
            <div className="text-white/40 text-xs pb-1">/ 100</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full bg-orange-400" style={{ width: `${data.tax_readiness}%` }} />
          </div>
          <div className="mt-2 text-[10px] tracking-[0.22em] uppercase text-orange-400">2 items to reconcile</div>
        </div>
      </div>

      {/* Row 3: Chart + AIAH insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 fade-up-delay-2">
        <GlassCard className="xl:col-span-2" testid="dashboard-cashflow-chart">
          <SectionHeader
            kicker="12 Month · Income vs Expense"
            title="Cash Flow Terminal"
            action={
              <div className="hidden md:flex items-center gap-4 text-[11px]">
                <Legend color="#00f0ff" label="Income" />
                <Legend color="#ff5f1f" label="Expense" />
              </div>
            }
          />
          <div className="h-[290px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5f1f" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#ff5f1f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(v) => formatMoney(v)}
                />
                <Area type="monotone" dataKey="income" stroke="#00f0ff" strokeWidth={2} fill="url(#gIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ff5f1f" strokeWidth={2} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard testid="dashboard-aiah-insights">
          <SectionHeader kicker="AIAH · Advisor Signals" title="Financial Insights" />
          <div className="space-y-3">
            {[
              { tone: "blue",   title: "Q3 tax reserve on track", body: "Set aside 22% of gross for federal + state. Current buffer covers 2 quarters." },
              { tone: "orange", title: "1 invoice trending late",  body: "Ableton AG · $6,000 · 8 days past due. Consider a friendly nudge or 1.5% late fee." },
              { tone: "violet", title: "New sync opportunity",     body: "A24 Films is aligned with your catalog. Estimated fee window: $18K–$32K." },
              { tone: "green",  title: "Runway extended",          body: "Cash + pending royalties give you 11.4 months of coverage at current burn." },
            ].map((i, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    i.tone === "blue"   ? "bg-cyan-400"    :
                    i.tone === "orange" ? "bg-orange-400"  :
                    i.tone === "violet" ? "bg-violet-400"  : "bg-emerald-400"
                  }`} />
                  <div className="text-[12px] font-semibold">{i.title}</div>
                </div>
                <div className="text-[11.5px] text-white/55 leading-relaxed">{i.body}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/aiah")}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 hover:bg-white/[0.04] text-[12px]"
            data-testid="insights-open-aiah"
          >
            Open AIAH terminal <ArrowUpRight size={12} />
          </button>
        </GlassCard>
      </div>

      {/* Row 4: Recent txns + upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 fade-up-delay-3">
        <GlassCard className="xl:col-span-2" testid="dashboard-recent-txns">
          <SectionHeader kicker="Ledger" title="Recent Transactions" />
          <div className="overflow-x-auto">
            <table className="w-full exec-table">
              <thead>
                <tr><th>Date</th><th>Category</th><th>Description</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody>
                {data.recent_transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="text-white/55">{formatDate(t.date)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {t.type === "income"
                          ? <ArrowUpRight size={12} className="text-emerald-400" />
                          : <ArrowDownRight size={12} className="text-orange-400" />
                        }
                        {t.category}
                      </div>
                    </td>
                    <td className="text-white/60">{t.subcategory || t.description}</td>
                    <td className={`text-right font-medium ${t.type === "income" ? "text-white" : "text-white/70"}`}>
                      {t.type === "income" ? "+" : "−"}{formatMoney(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard testid="dashboard-upcoming">
          <SectionHeader kicker="Coming Up" title="Upcoming Payments" />
          <div className="space-y-2">
            {data.upcoming_payments.length === 0 && <div className="text-white/40 text-sm">No upcoming payments.</div>}
            {data.upcoming_payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                <div>
                  <div className="text-[13px] font-medium">{p.name}</div>
                  <div className="text-[10.5px] tracking-[0.18em] uppercase text-white/40">{p.type} · Due {formatDate(p.due_date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-medium">{formatCompactMoney(p.amount)}</div>
                  <StatusPill status="Pending" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-white/50">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
