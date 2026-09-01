import { useEffect, useState } from "react";
import api, { formatMoney } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard } from "@/components/primitives";

const TYPE_COLORS = {
  Monthly: "bg-cyan-400",
  Tour:    "bg-violet-400",
  Album:   "bg-orange-400",
  Project: "bg-emerald-400",
  Film:    "bg-fuchsia-400",
  "Writing Camp": "bg-yellow-400",
  Grant:   "bg-blue-400",
  Department: "bg-pink-400",
  Savings: "bg-teal-400",
};

export default function Budget() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    api.get("/budgets").then((r) => setBudgets(r.data));
  }, []);

  const totalAllocated = budgets.reduce((a, b) => a + b.total_amount, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-8" data-testid="budget-page">
      <PageHeader
        kicker="Budget · Planning Command"
        title={<>Monthly. Tour. Album. Film. <span className="gradient-text">Every project.</span></>}
        subtitle="Executive budgeting for creative businesses — with department, project, savings, and grant tracking."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Allocated" value={totalAllocated} accent="grad" compact testid="budget-kpi-total" />
        <KPICard label="Total Spent" value={totalSpent} accent="orange" compact />
        <KPICard label="Remaining" value={remaining} accent="green" compact />
        <KPICard label="Budgets Active" value={String(budgets.length)} accent="violet" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="budget-cards">
        {budgets.map((b) => {
          const pct = Math.min(100, (b.spent / b.total_amount) * 100);
          const overBudget = pct > 90;
          return (
            <GlassCard key={b.id} hover>
              <div className="flex items-center justify-between mb-3">
                <div className={`px-2 py-0.5 rounded text-[10px] tracking-[0.18em] uppercase font-semibold ${TYPE_COLORS[b.type] || "bg-white/10"} text-black/80`}>
                  {b.type}
                </div>
                <div className={`text-[10px] tracking-[0.18em] uppercase ${overBudget ? "text-orange-400" : "text-emerald-400"}`}>
                  {pct.toFixed(0)}% used
                </div>
              </div>
              <div className="font-display text-lg mb-1">{b.name}</div>
              <div className="text-[11px] text-white/45 mb-3">
                Period {b.period_start} → {b.period_end}
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="eyebrow">Spent</div>
                  <div className="kpi-value text-[20px]">{formatMoney(b.spent)}</div>
                </div>
                <div className="text-right">
                  <div className="eyebrow">Cap</div>
                  <div className="text-[13px] text-white/70">{formatMoney(b.total_amount)}</div>
                </div>
              </div>

              <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden mt-2">
                <div className={`h-full ${overBudget ? "bg-orange-400" : "gradient-bar"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-white/50">
                {formatMoney(b.total_amount - b.spent)} remaining
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
