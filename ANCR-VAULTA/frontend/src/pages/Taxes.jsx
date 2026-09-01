import { useEffect, useState } from "react";
import api, { formatMoney } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { FileText, Download } from "lucide-react";

export default function Taxes() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/taxes/overview").then((r) => setData(r.data));
  }, []);
  if (!data) return <div className="text-white/40 text-sm">Loading tax center…</div>;

  return (
    <div className="space-y-8" data-testid="taxes-page">
      <PageHeader
        kicker="Tax Center"
        title={<>Quarterly. Deductions. <span className="gradient-text">Ready for your CPA.</span></>}
        subtitle="Estimated taxes, quarterly payments, sales tax, income tax, 1099/W-2 tracking, deductions, receipts — export-ready."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Taxable Income" value={data.taxable_income} accent="grad" compact testid="taxes-kpi-taxable" />
        <KPICard label="Estimated Tax" value={data.estimated_tax} accent="orange" compact />
        <KPICard label="Deductions" value={data.total_deductions} accent="green" compact />
        <div className="glass p-5">
          <div className="eyebrow mb-3">Tax Readiness Score</div>
          <div className="flex items-end gap-3">
            <div className="kpi-value text-[36px] leading-none">{data.tax_readiness_score}</div>
            <div className="text-white/40 text-xs pb-1">/ 100</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full gradient-bar" style={{ width: `${data.tax_readiness_score}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2" testid="taxes-quarterly">
          <SectionHeader kicker="Quarterly Estimated Payments" title="2026 Filing Schedule" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.quarterly_payments.map((q) => (
              <div key={q.quarter} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="font-display text-2xl mb-1">{q.quarter}</div>
                <div className="text-[10.5px] tracking-[0.18em] uppercase text-white/45">Due {q.due}</div>
                <div className="text-[16px] font-medium mt-3">{formatMoney(q.amount)}</div>
                <div className="mt-2"><StatusPill status={q.status} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="eyebrow mb-3">Tax Forms</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.forms.map((f) => (
                <div key={f.form} className="p-3 rounded-md border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
                  <FileText size={14} className="text-cyan-400" />
                  <div className="flex-1">
                    <div className="text-[12px] font-medium">{f.form}</div>
                    <div className="text-[10px] text-white/45 tracking-[0.14em] uppercase">{f.count} received</div>
                  </div>
                  <StatusPill status={f.status} />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard testid="taxes-deductions">
          <SectionHeader kicker="Optimizer" title="Top Deductions" action={
            <button className="text-[11px] text-white/60 hover:text-white flex items-center gap-1.5">
              <Download size={11} /> Export
            </button>
          } />
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {data.deductions_by_category.slice(0, 12).map((d) => (
              <div key={d.category} className="flex items-center justify-between p-2.5 rounded-md hover:bg-white/[0.03]">
                <div className="text-[12.5px]">{d.category}</div>
                <div className="text-[13px] font-medium">{formatMoney(d.amount)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
