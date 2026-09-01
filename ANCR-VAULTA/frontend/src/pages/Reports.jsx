import { useEffect, useState } from "react";
import api, { formatMoney } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard } from "@/components/primitives";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Line, LineChart } from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";

export default function Reports() {
  const [pnl, setPnl] = useState(null);
  const [cf, setCf] = useState(null);

  useEffect(() => {
    api.get("/reports/pnl").then((r) => setPnl(r.data));
    api.get("/reports/cashflow").then((r) => setCf(r.data));
  }, []);

  if (!pnl || !cf) return <div className="text-white/40 text-sm">Compiling reports…</div>;

  return (
    <div className="space-y-8" data-testid="reports-page">
      <PageHeader
        kicker="Reports · Executive Analytics"
        title={<>P&L. Cash Flow. <span className="gradient-text">Balance Sheet.</span></>}
        subtitle="Monthly and annual reports for investors, accountants, and executive review — with PDF and Excel export."
        right={
          <div className="hidden md:flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/[0.04] text-[11.5px] flex items-center gap-1.5">
              <Download size={12} /> PDF
            </button>
            <button className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/[0.04] text-[11.5px] flex items-center gap-1.5">
              <FileSpreadsheet size={12} /> Excel
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Revenue" value={pnl.total_income} accent="grad" compact testid="reports-kpi-revenue" />
        <KPICard label="Total Expense" value={pnl.total_expense} accent="orange" compact />
        <KPICard label="Net Profit" value={pnl.net_profit} accent="green" compact testid="reports-kpi-net" />
        <KPICard label="Profit Margin" value={`${((pnl.net_profit / pnl.total_income) * 100).toFixed(1)}%`} accent="violet" />
      </div>

      <GlassCard testid="reports-cashflow-chart">
        <SectionHeader kicker="Cash Flow Statement" title="Monthly Net Cash Flow" />
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cf.series}>
              <defs>
                <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatMoney(v)} />
              <Area type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={2} fill="url(#gNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard testid="reports-income-breakdown">
          <SectionHeader kicker="Income" title="Revenue by Category" />
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {pnl.income.slice(0, 15).map((i) => (
              <div key={i.category} className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-white/[0.03]">
                <div className="text-[12.5px]">{i.category}</div>
                <div className="text-[13px] font-medium text-emerald-400">+{formatMoney(i.amount)}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="reports-expense-breakdown">
          <SectionHeader kicker="Expense" title="Spend by Category" />
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {pnl.expense.slice(0, 15).map((e) => (
              <div key={e.category} className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-white/[0.03]">
                <div className="text-[12.5px]">{e.category}</div>
                <div className="text-[13px] font-medium text-orange-400">−{formatMoney(e.amount)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard testid="reports-balance-sheet">
        <SectionHeader kicker="Statement" title="Balance Sheet (as of today)" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="eyebrow mb-3">Assets</div>
            {[
              ["Cash & Equivalents", 168420],
              ["Accounts Receivable", 62800],
              ["Music Catalog (Est.)", 340000],
              ["Equipment", 84200],
              ["Investments", 92800],
            ].map(([k, v]) => (
              <Row key={k} label={k} value={v} tone="text-white" />
            ))}
            <Row label="Total Assets" value={168420 + 62800 + 340000 + 84200 + 92800} bold />
          </div>
          <div>
            <div className="eyebrow mb-3">Liabilities</div>
            {[
              ["Credit Cards", 10572],
              ["Advance Recoup Balance", 42000],
              ["Deferred Taxes", 27400],
            ].map(([k, v]) => (
              <Row key={k} label={k} value={v} tone="text-orange-400" />
            ))}
            <Row label="Total Liabilities" value={10572 + 42000 + 27400} bold />
          </div>
          <div>
            <div className="eyebrow mb-3">Equity</div>
            <Row label="Owner's Equity" value={748220 - 79972 - 42000} bold tone="text-white" />
            <div className="mt-6 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <div className="eyebrow mb-1">Net Worth</div>
              <div className="kpi-value text-2xl gradient-text">{formatMoney(748220 - 79972)}</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ label, value, bold = false, tone = "text-white/70" }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-white/[0.05] ${bold ? "font-medium" : ""}`}>
      <span className={`text-[12.5px] ${bold ? "text-white" : "text-white/70"}`}>{label}</span>
      <span className={`text-[13px] font-medium ${tone}`}>{formatMoney(value)}</span>
    </div>
  );
}
