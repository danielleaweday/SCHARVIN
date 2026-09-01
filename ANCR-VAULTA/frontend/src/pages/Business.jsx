import { useEffect, useState } from "react";
import api, { formatMoney } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { Building2, ShieldCheck, CreditCard, Landmark, Calendar } from "lucide-react";

export default function Business() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/business/profile").then((r) => setData(r.data));
  }, []);
  if (!data) return <div className="text-white/40 text-sm">Loading business dashboard…</div>;

  const totalCash = data.bank_accounts.reduce((a, b) => a + b.balance, 0);
  const totalCredit = data.credit_cards.reduce((a, b) => a + (b.limit - b.balance), 0);

  return (
    <div className="space-y-8" data-testid="business-page">
      <PageHeader
        kicker="Business Dashboard"
        title={<>Your company, <span className="gradient-text">operationally ready.</span></>}
        subtitle="LLC, DBA, nonprofit, EIN, licenses, insurance, bank accounts, business credit, compliance — orchestrated in one command."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Business Cash" value={totalCash} accent="grad" compact testid="business-kpi-cash" />
        <KPICard label="Available Credit" value={totalCredit} accent="blue" compact />
        <KPICard label="Business Credit Score" value={String(data.credit_score)} accent="green" sub="Excellent" />
        <KPICard label="Entities" value={String(data.entities.length)} accent="violet" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard testid="business-entities">
          <SectionHeader kicker="Company Structure" title="Entities" />
          <div className="space-y-3">
            {data.entities.map((e) => (
              <div key={e.name} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-cyan-400" />
                    <div className="font-medium">{e.name}</div>
                  </div>
                  <StatusPill status={e.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11.5px]">
                  <div><div className="eyebrow">Type</div><div className="mt-0.5">{e.type}</div></div>
                  <div><div className="eyebrow">State</div><div className="mt-0.5">{e.state}</div></div>
                  <div><div className="eyebrow">EIN</div><div className="mt-0.5 font-mono-tab">{e.ein}</div></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="business-accounts">
          <SectionHeader kicker="Banking" title="Bank Accounts & Cards" />
          <div className="space-y-2 mb-4">
            {data.bank_accounts.map((b) => (
              <div key={b.name} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Landmark size={14} className="text-violet-400" />
                  <div>
                    <div className="text-[12.5px] font-medium">{b.name}</div>
                    <div className="text-[10.5px] tracking-[0.14em] uppercase text-white/45">{b.bank} · {b.type}</div>
                  </div>
                </div>
                <div className="text-[14px] font-medium">{formatMoney(b.balance)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {data.credit_cards.map((c) => (
              <div key={c.last4} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={14} className="text-orange-400" />
                  <div>
                    <div className="text-[12.5px] font-medium">{c.issuer}</div>
                    <div className="text-[10.5px] tracking-[0.14em] uppercase text-white/45">•••• {c.last4}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px]">{formatMoney(c.balance)} / {formatMoney(c.limit)}</div>
                  <div className="text-[10px] text-emerald-400 tracking-[0.14em] uppercase">{Math.round((1 - c.balance / c.limit) * 100)}% avail</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard testid="business-licenses">
          <SectionHeader kicker="Compliance" title="Licenses" />
          <div className="space-y-2">
            {data.licenses.map((l) => (
              <div key={l.name} className="flex items-center justify-between p-2.5 rounded-md border border-white/[0.05] bg-white/[0.02]">
                <div>
                  <div className="text-[12.5px]">{l.name}</div>
                  <div className="text-[10px] text-white/45 tracking-[0.14em] uppercase">Expires {l.expires}</div>
                </div>
                <StatusPill status={l.status} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="business-insurance">
          <SectionHeader kicker="Coverage" title="Insurance" />
          <div className="space-y-2">
            {data.insurance.map((p) => (
              <div key={p.policy} className="p-2.5 rounded-md border border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <div className="text-[12.5px] font-medium">{p.policy}</div>
                </div>
                <div className="text-[10.5px] text-white/45 tracking-[0.14em] uppercase">
                  {p.carrier} · Premium {formatMoney(p.premium)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="business-compliance">
          <SectionHeader kicker="Calendar" title="Compliance Alerts" />
          <div className="space-y-2">
            {data.compliance.map((c) => (
              <div key={c.item} className="p-2.5 rounded-md border border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} className="text-orange-400" />
                  <div className="text-[12.5px] font-medium">{c.item}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] text-white/45 tracking-[0.14em] uppercase">Due {c.due}</div>
                  <StatusPill status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
