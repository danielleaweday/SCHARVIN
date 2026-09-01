import { useEffect, useState } from "react";
import api, { formatMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { FileSignature, Download } from "lucide-react";

const TYPE_TONE = {
  "Recording Agreement":   "text-orange-400",
  "Publishing Agreement":  "text-violet-400",
  "Licensing":             "text-cyan-400",
  "Producer Agreement":    "text-emerald-400",
  "Management Agreement":  "text-yellow-400",
  "Performance Contract":  "text-pink-400",
  "NDA":                   "text-white/70",
  "Endorsement":           "text-fuchsia-400",
  "Session Agreement":     "text-teal-400",
  "Internship":            "text-blue-400",
};

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  useEffect(() => {
    api.get("/contracts").then((r) => setContracts(r.data));
  }, []);

  const total = contracts.reduce((a, b) => a + (b.value || 0), 0);
  const active = contracts.filter((c) => c.status === "Signed").length;

  return (
    <div className="space-y-8" data-testid="contracts-page">
      <PageHeader
        kicker="Contracts Library · E-Signature"
        title={<>Every agreement, <span className="gradient-text">in one vault.</span></>}
        subtitle="Recording, publishing, licensing, producer, session, management, performance, endorsement, and NDA agreements — with version history and expiration alerts."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Contract Value" value={total} accent="grad" compact testid="contracts-kpi-value" />
        <KPICard label="Active" value={String(active)} accent="green" />
        <KPICard label="Total Contracts" value={String(contracts.length)} accent="blue" />
        <KPICard label="Expiring in 90d" value="2" accent="orange" />
      </div>

      <GlassCard testid="contracts-list">
        <SectionHeader kicker="Library" title="All Contracts" action={
          <button className="text-[11px] text-white/60 hover:text-white flex items-center gap-1.5" data-testid="contracts-new-btn">
            <FileSignature size={12} /> New Contract
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Counterparty</th>
                <th>Signed</th>
                <th>Expires</th>
                <th>Status</th>
                <th className="text-right">Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.title}</td>
                  <td className={TYPE_TONE[c.type] || "text-white/70"}>{c.type}</td>
                  <td className="text-white/70">{c.counterparty}</td>
                  <td className="text-white/50">{c.signed_date ? formatDate(c.signed_date) : "—"}</td>
                  <td className="text-white/50">{c.expiration_date ? formatDate(c.expiration_date) : "—"}</td>
                  <td><StatusPill status={c.status} /></td>
                  <td className="text-right font-medium">{c.value ? formatMoney(c.value) : "—"}</td>
                  <td className="text-right">
                    <button className="text-white/40 hover:text-white p-1"><Download size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
