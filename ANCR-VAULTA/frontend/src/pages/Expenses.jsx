import { useEffect, useState } from "react";
import api, { formatMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard } from "@/components/primitives";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Expenses() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/expenses/summary").then((r) => setData(r.data));
  }, []);
  if (!data) return <div className="text-white/40 text-sm">Loading expenses…</div>;

  const chartData = data.by_category.slice(0, 12);
  return (
    <div className="space-y-8" data-testid="expenses-page">
      <PageHeader
        kicker="Expenses · Every Category"
        title={<>Track and categorize <span className="gradient-text">every dollar out.</span></>}
        subtitle="Automatic categorization across travel, equipment, studio, marketing, payroll, and 25+ additional categories."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Expenses (14mo)" value={data.total} accent="orange" compact testid="expenses-kpi-total" />
        <KPICard label="Top Category" value={data.by_category[0]?.category || "—"} accent="violet" />
        <KPICard label="Categories Used" value={String(data.by_category.length)} accent="blue" />
        <KPICard label="Deductible (Est.)" value={data.total * 0.78} accent="green" compact sub="≈ 78% of total" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2" testid="expenses-bar-chart">
          <SectionHeader kicker="Top Expense Categories" title="Spend Distribution" />
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ff5f1f" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.35)" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" stroke="rgba(255,255,255,0.55)" fontSize={11} width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="amount" fill="url(#gBar)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard testid="expenses-breakdown">
          <SectionHeader kicker="Deep Ledger" title="All Categories" />
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-2">
            {data.by_category.map((c) => (
              <div key={c.category} className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-white/[0.03]">
                <div>
                  <div className="text-[12.5px]">{c.category}</div>
                  <div className="text-[10px] text-white/40 tracking-[0.14em] uppercase">{c.pct}%</div>
                </div>
                <div className="text-[13px] font-medium">{formatMoney(c.amount)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard testid="expenses-transactions">
        <SectionHeader kicker="Ledger" title="Expense Transactions" />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr><th>Date</th><th>Category</th><th>Vendor</th><th>Description</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {data.items.slice(0, 40).map((t) => (
                <tr key={t.id}>
                  <td className="text-white/55">{formatDate(t.date)}</td>
                  <td>{t.category}</td>
                  <td className="text-white/70">{t.client || t.subcategory}</td>
                  <td className="text-white/55">{t.description || t.subcategory}</td>
                  <td className="text-right text-orange-400 font-medium">−{formatMoney(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
