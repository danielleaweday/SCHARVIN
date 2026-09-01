import { useEffect, useState } from "react";
import api, { formatMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard } from "@/components/primitives";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#00f0ff", "#8b5cf6", "#ff5f1f", "#22d3ee", "#a78bfa", "#fb923c", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

export default function Income() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/income/summary").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="text-white/40 text-sm">Loading income streams…</div>;

  const top = data.by_category.slice(0, 8);
  const otherTotal = data.by_category.slice(8).reduce((a, b) => a + b.amount, 0);
  const pieData = otherTotal > 0 ? [...top, { category: "Other", amount: otherTotal }] : top;

  return (
    <div className="space-y-8" data-testid="income-page">
      <PageHeader
        kicker="Income · All Revenue Streams"
        title={<>Every revenue channel, <span className="gradient-text">unified.</span></>}
        subtitle="From performance fees and sync licenses to streaming royalties and brand deals — Vaulta tracks it all."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Income (14mo)" value={data.total} accent="grad" compact testid="income-kpi-total" />
        <KPICard label="Top Category" value={data.by_category[0]?.category || "—"} accent="blue" testid="income-kpi-top" />
        <KPICard label="Streams Tracked" value={String(data.by_category.length)} accent="violet" sub="active categories" />
        <KPICard label="Avg per Stream" value={data.by_category.length ? data.total / data.by_category.length : 0} accent="orange" compact />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <GlassCard className="xl:col-span-2" testid="income-mix-chart">
          <SectionHeader kicker="Revenue Mix" title="By Category" />
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="amount" nameKey="category" innerRadius={70} outerRadius={110} strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-3" testid="income-breakdown">
          <SectionHeader kicker="Ledger" title="Category Breakdown" />
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
            {data.by_category.map((c, i) => (
              <div key={c.category} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03]">
                <div className="w-2 h-8 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{c.category}</div>
                  <div className="text-[10.5px] text-white/40 tracking-[0.14em] uppercase">{c.pct}% of total</div>
                </div>
                <div className="w-40 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full" style={{ width: `${c.pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div className="w-28 text-right font-medium">{formatMoney(c.amount)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard testid="income-transactions">
        <SectionHeader kicker="Ledger" title="Income Transactions" />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr><th>Date</th><th>Category</th><th>Client / Source</th><th>Description</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {data.items.slice(0, 40).map((t) => (
                <tr key={t.id}>
                  <td className="text-white/55">{formatDate(t.date)}</td>
                  <td>{t.category}</td>
                  <td className="text-white/70">{t.client || t.subcategory}</td>
                  <td className="text-white/55">{t.subcategory}</td>
                  <td className="text-right text-emerald-400 font-medium">+{formatMoney(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
