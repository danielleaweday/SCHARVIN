import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard } from "@/components/primitives";
import { Lock, FileText, ShieldCheck, Search } from "lucide-react";

const CATEGORY_TONE = {
  "Tax Returns": "text-cyan-400",
  "Business Documents": "text-violet-400",
  "Contracts": "text-orange-400",
  "Identification": "text-emerald-400",
  "Insurance": "text-yellow-400",
  "Certificates": "text-pink-400",
  "Estate Planning": "text-fuchsia-400",
  "Emergency Documents": "text-red-400",
  "Receipts": "text-blue-400",
};

export default function Vault() {
  const [docs, setDocs] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    api.get("/vault/documents").then((r) => setDocs(r.data));
  }, []);

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(q.toLowerCase()) ||
    d.category.toLowerCase().includes(q.toLowerCase())
  );

  const byCat = docs.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-8" data-testid="vault-page">
      <PageHeader
        kicker="Secure Vault · AES-256 Encrypted"
        title={<>Your most important documents, <span className="gradient-text">sealed.</span></>}
        subtitle="Tax returns, business documents, contracts, passports, licenses, insurance, certificates, estate plans, emergency documents — encrypted end-to-end."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Documents Secured" value={String(docs.length)} accent="grad" testid="vault-kpi-total" />
        <KPICard label="Categories" value={String(Object.keys(byCat).length)} accent="blue" />
        <KPICard label="Encryption" value="AES-256" accent="green" sub="End-to-end" />
        <KPICard label="Last Backup" value="2m ago" accent="violet" sub="Automatic" />
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <Search size={13} className="text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vault…"
            data-testid="vault-search"
            className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-white/30"
          />
        </div>
        <div className="text-[10.5px] tracking-[0.18em] uppercase text-white/40 flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-400" /> Sealed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="vault-docs">
        {filtered.map((d) => (
          <GlassCard key={d.id} hover className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <FileText size={14} className={CATEGORY_TONE[d.category] || "text-white"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{d.name}</div>
                <div className={`text-[10px] tracking-[0.18em] uppercase mt-0.5 ${CATEGORY_TONE[d.category] || "text-white/60"}`}>
                  {d.category}
                </div>
              </div>
              <Lock size={11} className="text-emerald-400 mt-1" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10.5px] text-white/40">
              <span>{d.size_kb} KB</span>
              <span>Encrypted</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
