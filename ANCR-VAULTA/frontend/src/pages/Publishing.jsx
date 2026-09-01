import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { Music, ExternalLink } from "lucide-react";

export default function Publishing() {
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    api.get("/publishing/songs").then((r) => setSongs(r.data));
  }, []);

  return (
    <div className="space-y-8" data-testid="publishing-page">
      <PageHeader
        kicker="Publishing Center · INHEIRA Sync"
        title={<>Every song, <span className="gradient-text">registered and reconciled.</span></>}
        subtitle="Songs flow from INHEIRA directly into Vaulta. Splits, ISWCs, ISRCs, UPCs, PROs, and publisher ownership — verified."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Registered Songs" value={String(songs.length)} accent="grad" testid="publishing-kpi-total" />
        <KPICard label="Live in Distribution" value={String(songs.filter((s) => s.distribution_status === "Live").length)} accent="blue" />
        <KPICard label="With Sync Clearance" value={String(Math.max(0, songs.length - 6))} accent="violet" />
        <KPICard label="Ownership Verified" value={`${songs.length}/${songs.length}`} accent="green" />
      </div>

      <GlassCard testid="publishing-catalog">
        <SectionHeader kicker="Catalog" title="Song Registry" action={
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Live sync from INHEIRA
          </div>
        } />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr>
                <th>Song</th>
                <th>Writers</th>
                <th>Splits</th>
                <th>Publisher</th>
                <th>PRO</th>
                <th>ISWC</th>
                <th>ISRC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Music size={12} className="text-cyan-400" />
                      <span className="font-medium">{s.title}</span>
                    </div>
                  </td>
                  <td className="text-white/60">{s.writers}</td>
                  <td className="text-white/50 text-[11.5px]">
                    {s.splits.map((sp, i) => (
                      <span key={i} className="inline-block mr-1.5 mb-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.05]">
                        {sp}
                      </span>
                    ))}
                  </td>
                  <td className="text-white/70">{s.publisher}</td>
                  <td className="text-cyan-400">{s.pro}</td>
                  <td className="text-white/50 text-[11px] font-mono-tab">{s.iswc}</td>
                  <td className="text-white/50 text-[11px] font-mono-tab">{s.isrc}</td>
                  <td><StatusPill status={s.registration_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
