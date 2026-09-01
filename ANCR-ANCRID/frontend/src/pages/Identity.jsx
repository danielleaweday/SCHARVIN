import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import GlassCard, { SectionTitle } from "@/components/GlassCard";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function Identity() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/ancrid/identity").then(r => setData(r.data)); }, []);
  const u = data?.user || {}, i = data?.identity || {};

  return (
    <div className="space-y-8" data-testid="identity-page">
      <SectionTitle eyebrow="Identity · Verified Record" title="Your permanent professional identity." testid="identity-title" />

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden" testid="identity-hero">
          <div className="relative h-56">
            {i.banner_url && <img src={i.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-black/10" />
          </div>
          <div className="px-7 pb-7 -mt-14 relative flex items-end gap-6 flex-wrap">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/20 bg-black shrink-0">
              {i.headshot_url && <img src={i.headshot_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <div className="font-display text-3xl md:text-4xl tracking-tight text-white">{u.professional_name}</div>
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50 mt-1">{u.role} · {i.pronouns}</div>
              <div className="text-white/60 text-sm mt-1">{i.location}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full px-3 py-1.5">
              <ShieldCheck size={12} /> {i.verification_status}
            </span>
          </div>

          <div className="px-7 pb-7 grid md:grid-cols-2 gap-6">
            <Detail label="Biography" value={i.biography} />
            <Detail label="Mission" value={i.mission} />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard testid="identity-numbers">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Credentials on File</div>
            <div className="grid grid-cols-2 gap-5 mt-4">
              <Kv k="ANCRID №"  v={i.ancrid_number} />
              <Kv k="Passport"  v={i.creator_passport_id} />
              <Kv k="Institution" v={i.institution} short />
              <Kv k="Since"     v={i.member_since} />
            </div>
          </GlassCard>

          <GlassCard testid="identity-links">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Presence</div>
            <div className="mt-3 space-y-2">
              {i.website && (
                <a href={i.website} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-white/80 hover:text-white border-b border-white/5 pb-2">
                  <span className="truncate">{i.website}</span><ExternalLink size={13} />
                </a>
              )}
              {Object.entries(i.social_links || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-b-0">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">{k}</span>
                  <span className="text-white/80">{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard testid="identity-languages">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-3">Languages</div>
            <div className="flex flex-wrap gap-2">
              {(i.languages || []).map(l => (
                <span key={l} className="text-xs text-white/80 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">{l}</span>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">{label}</div>
      <div className="text-white/75 text-sm leading-relaxed">{value}</div>
    </div>
  );
}
function Kv({ k, v, short }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">{k}</div>
      <div className={`text-white text-sm mt-1 ${short ? "" : "font-mono"}`}>{v}</div>
    </div>
  );
}
