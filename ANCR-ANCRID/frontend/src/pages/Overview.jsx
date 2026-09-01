import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import EcosystemStatus from "@/components/EcosystemStatus";
import GlassCard, { ScoreDial } from "@/components/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowRight, ShieldCheck, ExternalLink, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/ancrid/overview").then((r) => setData(r.data)).catch(() => {});
  }, []);

  const identity = data?.identity || user?.identity || {};
  const shareUrl = user?.handle ? `${window.location.origin}/@${user.handle}` : "";

  async function copyShare() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Public link copied");
  }

  return (
    <div className="space-y-8" data-testid="overview-page">
      {/* Ecosystem Status */}
      <EcosystemStatus items={data?.ecosystem} />

      {/* Header row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Passport card */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden relative fade-up-2" data-testid="passport-card">
          <img
            alt=""
            src={identity.banner_url}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black" />
          <div className="relative p-7 md:p-9">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/50">ANCRID · Creator Passport</div>
                <div className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-3">{user?.professional_name}</div>
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50 mt-2">{user?.role}</div>
                <div className="text-white/60 text-sm mt-2">{identity.location} · {identity.discipline || user?.discipline}</div>
              </div>
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                {identity.headshot_url && (
                  <img src={identity.headshot_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Field k="ANCRID №" v={identity.ancrid_number} mono />
              <Field k="Passport" v={identity.creator_passport_id} mono />
              <Field k="Verified" v={<span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#00e5ff]" />{identity.verification_status}</span>} />
              <Field k="Member Since" v={identity.member_since} mono />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              {(identity.verified_badges || []).map(b => (
                <span key={b} className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/70 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">
                  {b}
                </span>
              ))}
              {user?.handle && (
                <div className="ml-auto flex items-center gap-2" data-testid="passport-share">
                  <button onClick={copyShare} className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-white/70 hover:text-white bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5" data-testid="passport-copy-link">
                    {copied ? <Check size={11} className="text-[#00e5ff]" /> : <Copy size={11} />}
                    @{user.handle}
                  </button>
                  <Link to={`/@${user.handle}`} target="_blank" className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-white/70 hover:text-white bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5" data-testid="passport-open-link">
                    <ExternalLink size={11} /> View public
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="glass rounded-3xl p-7 fade-up-3 flex flex-col gap-6" data-testid="scores-card">
          <div>
            <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/40">Identity Signals</div>
            <div className="font-display text-2xl tracking-tight text-white mt-1">Your record, quantified.</div>
          </div>
          <ScoreDial label="Portfolio" value={identity.portfolio_score || 0} />
          <ScoreDial label="Creative Impact" value={identity.creative_reputation_score || 0} />
          <ScoreDial label="Readiness" value={identity.professional_readiness_score || 0} />
        </div>
      </div>

      {/* Insights + Recent Timeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" testid="ai-insights-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/40 flex items-center gap-2">
                <Sparkles size={12} className="text-[#8a2be2]" /> AIAH · Identity Intelligence
              </div>
              <div className="font-display text-2xl tracking-tight text-white mt-1">What to move next.</div>
            </div>
            <Link to="/app/network" className="text-xs text-white/50 hover:text-white transition-colors">See all</Link>
          </div>
          <div className="space-y-3">
            {(data?.ai_insights || []).map((s, i) => (
              <div key={i} className="border border-white/5 rounded-2xl p-4 hover-lift bg-white/[0.02]" data-testid={`ai-insight-${i}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">{s.category}</div>
                    <div className="text-white text-sm mt-1">{s.title}</div>
                    <div className="text-white/50 text-xs leading-relaxed mt-1.5">{s.reason}</div>
                  </div>
                  <button className="shrink-0 text-xs text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-full px-3 py-1.5 transition-colors">
                    {s.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard testid="recent-timeline-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/40">Recent Milestones</div>
              <div className="font-display text-2xl tracking-tight text-white mt-1">Your ledger.</div>
            </div>
            <Link to="/app/timeline" className="text-xs text-white/50 hover:text-white transition-colors inline-flex items-center gap-1">See all <ArrowRight size={11} /></Link>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
            <div className="space-y-4">
              {(data?.recent_timeline || []).map((t, i) => (
                <div key={i} className="relative pl-6">
                  <span className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border ${i === 0 ? "border-[#00e5ff] bg-[#00e5ff]/20" : "border-white/20 bg-white/5"}`} />
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">{t.date} · {t.app}</div>
                  <div className="text-white text-sm mt-0.5">{t.title}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ k, v, mono }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">{k}</div>
      <div className={`${mono ? "font-mono" : ""} text-white text-sm mt-1`}>{v}</div>
    </div>
  );
}
