import { useEffect, useState } from "react";
import api, { formatMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";

const PRO_COLORS = {
  ASCAP: "text-cyan-400",
  BMI: "text-violet-400",
  SESAC: "text-orange-400",
  SoundExchange: "text-emerald-400",
  MLC: "text-pink-400",
  "Harry Fox": "text-yellow-400",
};

export default function Royalties() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/royalties").then((r) => setData(r.data));
  }, []);
  if (!data) return <div className="text-white/40 text-sm">Loading royalties command center…</div>;

  return (
    <div className="space-y-8" data-testid="royalties-page">
      <PageHeader
        kicker="Royalties Command Center"
        title={<>ASCAP. BMI. SESAC. <span className="gradient-text">All of it.</span></>}
        subtitle="Publishing, mechanical, performance, neighboring rights, master royalties, and songwriter/publisher shares — reconciled and forecasted."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Paid" value={data.total_paid} accent="grad" compact testid="royalties-kpi-paid" />
        <KPICard label="Pending" value={data.total_pending} accent="orange" compact />
        <KPICard label="Estimated Next Q" value={data.estimated_next_quarter} accent="violet" compact />
        <KPICard label="Registries Connected" value={String(data.by_pro.length)} accent="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2" testid="royalties-pros">
          <SectionHeader kicker="Performance Rights Organizations" title="Registry Overview" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.by_pro.map((p) => (
              <div key={p.pro} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className={`font-display text-xl ${PRO_COLORS[p.pro] || "text-white"}`}>{p.pro}</div>
                  <StatusPill status="Connected" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Metric label="Received" value={formatMoney(p.amount)} />
                  <Metric label="Pending" value={formatMoney(p.pending)} />
                  <Metric label="Statements" value={String(p.count)} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="royalties-forecast">
          <SectionHeader kicker="Forecast" title="Next 3 Quarters" />
          <div className="space-y-3">
            {["Q3 · 2026", "Q4 · 2026", "Q1 · 2027"].map((q, i) => (
              <div key={q} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium">{q}</div>
                  <div className="text-[10px] text-white/45 tracking-[0.14em] uppercase mt-0.5">Estimated payout</div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-medium">
                    {formatMoney(data.estimated_next_quarter * (1 + i * 0.06))}
                  </div>
                  <div className="text-[10px] text-emerald-400 tracking-[0.14em] uppercase">+{6 + i * 2}%</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg gradient-border">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/45">AIAH Signal</div>
            <div className="text-[12px] text-white/75 mt-1 leading-relaxed">
              Missing statement detected from SESAC for period 2025-11.
              Estimated recovery: <span className="text-cyan-400">{formatMoney(1240)}</span>.
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard testid="royalties-statements">
        <SectionHeader kicker="Ledger" title="Royalty Statements" />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr><th>PRO / Registry</th><th>Type</th><th>Song</th><th>Period</th><th>Status</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {data.items.slice(0, 30).map((r) => (
                <tr key={r.id}>
                  <td className={`font-medium ${PRO_COLORS[r.pro] || "text-white"}`}>{r.pro}</td>
                  <td className="text-white/60">{r.type}</td>
                  <td className="text-white/70">{r.song}</td>
                  <td className="text-white/50">{r.period}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="text-right font-medium">{formatMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-[9.5px] tracking-[0.18em] uppercase text-white/40">{label}</div>
      <div className="text-[13px] mt-0.5 font-medium">{value}</div>
    </div>
  );
}
