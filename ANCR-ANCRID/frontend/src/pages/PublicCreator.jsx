import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck, Fingerprint, Stamp, ArrowRight, Globe2, Link2, Quote,
} from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function PublicCreator() {
  const { pathname } = useLocation();
  const handle = pathname.startsWith("/@") ? pathname.slice(2) : "";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!handle) return;
    axios.get(`${BACKEND}/api/public/creator/${handle}`)
      .then(r => setData(r.data))
      .catch(() => setError("Creator not found"));
  }, [handle]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-4xl text-white tracking-tighter">Identity not found</div>
          <div className="text-white/40 text-sm mt-3 font-mono uppercase tracking-[0.2em]">No verified ANCRID with handle @{handle}</div>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 text-sm bg-white text-black px-5 py-3 rounded-full">
            Back to ANCRID <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen" />;

  const i = data.identity || {};
  const issuedYear = i.member_since ? i.member_since.slice(0, 4) : "";

  return (
    <div className="min-h-screen" data-testid="public-creator-page">
      {/* Official ribbon */}
      <div className="w-full bg-gradient-to-r from-[#00e5ff]/10 via-[#8a2be2]/10 to-[#ff6d00]/10 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-2.5 flex items-center justify-between text-[10px] font-mono tracking-[0.3em] uppercase text-white/50">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={11} className="text-[#00e5ff]" /> Verified Creator Identity · Issued by ANCRID Trust
          </span>
          <span className="hidden md:inline">Record № {i.ancrid_number}</span>
        </div>
      </div>

      {/* Nav */}
      <header className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <div className="font-display text-xl tracking-tighter text-white leading-none">ANCRID<span className="text-white/40 text-xs align-super">™</span></div>
            <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/40 mt-0.5">Part of the ANCR Ecosystem</div>
          </div>
        </Link>
        <Link to="/signup" data-testid="public-cta"
              className="inline-flex items-center gap-2 text-sm font-medium text-black bg-white px-4 py-2 rounded-full hover:bg-white/90">
          Claim your ANCRID <ArrowRight size={14} />
        </Link>
      </header>

      {/* Identity Document */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-4 pb-12">
        <div className="relative rounded-3xl overflow-hidden ancr-gradient-border" data-testid="public-passport">
          <div className="bg-[#070707] rounded-3xl relative">
            {/* Corner marks (formal document feel) */}
            <CornerMark className="top-4 left-4" />
            <CornerMark className="top-4 right-4 rotate-90" />
            <CornerMark className="bottom-4 left-4 -rotate-90" />
            <CornerMark className="bottom-4 right-4 rotate-180" />

            {/* Watermark banner */}
            {i.banner_url && (
              <div className="relative h-56 md:h-72 overflow-hidden">
                <img src={i.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#070707]/70 to-[#070707]" />
              </div>
            )}

            <div className="px-8 md:px-14 pt-4 pb-10 relative">
              <div className="flex items-start justify-between flex-wrap gap-6 -mt-24 md:-mt-28">
                <div className="flex items-end gap-6 flex-wrap min-w-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#00e5ff]/40 via-[#8a2be2]/40 to-[#ff6d00]/40 blur-md" />
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/25 bg-black">
                      {i.headshot_url && <img src={i.headshot_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                  <div className="min-w-0 pb-2">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Full Legal Bearer</div>
                    <div className="font-display text-4xl md:text-6xl tracking-tighter text-white mt-2 leading-none">
                      {data.professional_name}
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/60 mt-3">
                      @{data.handle} · {data.role}
                    </div>
                  </div>
                </div>

                {/* Verified seal */}
                <div className="relative shrink-0 pt-2 md:pt-4" data-testid="verified-seal">
                  <div className="relative w-28 h-28">
                    <div className="absolute inset-0 rounded-full border border-[#00e5ff]/40 animate-[spin_18s_linear_infinite]">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                          <path id="sealPath" d="M50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                        </defs>
                        <text className="fill-white/40" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", letterSpacing: "2px" }}>
                          <textPath href="#sealPath">VERIFIED · ANCRID TRUST · ISSUED {issuedYear} · </textPath>
                        </text>
                      </svg>
                    </div>
                    <div className="absolute inset-4 rounded-full border border-white/10 flex items-center justify-center">
                      <ShieldCheck size={26} className="text-[#00e5ff]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine-readable line */}
              <div className="mt-8 border border-white/10 rounded-2xl px-5 py-4 bg-white/[0.02] font-mono text-[11px] tracking-[0.18em] text-white/70 flex flex-wrap gap-x-6 gap-y-2" data-testid="mrz">
                <span>ID&lt;&lt;{i.ancrid_number?.replace(/-/g, "<<")}</span>
                <span>PSPT&lt;&lt;{i.creator_passport_id}</span>
                <span>HDL&lt;&lt;{data.handle?.toUpperCase()}</span>
                <span>ISS&lt;&lt;{issuedYear}</span>
                <span>STATE&lt;&lt;{(i.verification_status || "").toUpperCase()}</span>
              </div>

              {/* Meta grid — formal record fields */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
                <RecordField k="Identity Number" v={i.ancrid_number} mono />
                <RecordField k="Creator Passport" v={i.creator_passport_id} mono />
                <RecordField k="Issued" v={i.member_since} mono />
                <RecordField k="Nationality of Practice" v={i.location} />
                <RecordField k="Institution of Record" v={data.institution} />
                <RecordField k="Primary Discipline" v={data.discipline} />
                <RecordField k="Languages" v={(i.languages || []).join(" · ")} />
                <RecordField k="Verification State" v={i.verification_status} tint="#00e5ff" />
              </div>

              {/* Verifications */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">Verifications On Record</div>
                <div className="flex flex-wrap gap-2">
                  {(i.verified_badges || []).map(b => (
                    <span key={b} className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-white/85 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
                      <Stamp size={11} className="text-[#00e5ff]" /> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attestation line */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono tracking-[0.24em] uppercase text-white/40 px-2">
          <span>This record is machine-verifiable via ANCR partner endpoints.</span>
          <span className="inline-flex items-center gap-2">
            <Fingerprint size={11} className="text-white/50" /> Chain of custody: ANCRID Trust
          </span>
        </div>
      </section>

      {/* Signals row */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <SignalCard label="Portfolio Score" value={i.portfolio_score} />
          <SignalCard label="Creative Impact" value={i.creative_reputation_score} />
          <SignalCard label="Professional Readiness" value={i.professional_readiness_score} />
        </div>
      </section>

      {/* Statement of Purpose */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 glass rounded-3xl p-8 md:p-10">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Statement of Practice</div>
            <div className="mt-4 flex gap-3">
              <Quote size={20} className="text-white/30 shrink-0" />
              <div className="text-white/85 text-lg leading-relaxed font-display tracking-tight">
                {i.biography}
              </div>
            </div>
            {i.mission && (
              <>
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mt-8">Declared Mission</div>
                <div className="text-white/80 text-base leading-relaxed mt-2">{i.mission}</div>
              </>
            )}
            {i.website && (
              <a href={i.website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm border-t border-white/5 pt-4">
                <Globe2 size={14} /> {i.website}
              </a>
            )}
          </div>

          <div className="lg:col-span-2 glass rounded-3xl p-8">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Verified Competencies</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(data.skills || []).map(s => (
                <span key={s} className="text-xs text-white/85 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body of Work */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <SectionHeader eyebrow="Body of Work · Verified Record" title="Registered creative output." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {(data.portfolio || []).map(p => (
            <div key={p.id} className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover-lift">
              <div className="relative h-40 overflow-hidden">
                <img src={p.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 left-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/80 bg-black/50 border border-white/10 rounded-full px-2 py-1">{p.medium}</div>
              </div>
              <div className="p-4">
                <div className="text-white text-sm font-display tracking-tight">{p.title}</div>
                <div className="text-white/50 text-xs mt-0.5">{p.role} · {p.year}</div>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                  <Link2 size={10} /> {p.connected_app}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Journey (chapter strip) */}
      {data.journey?.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
          <SectionHeader eyebrow="Creator Journey" title="Documented progression, chapter by chapter." />
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.journey.map((c, idx) => (
              <div key={c.code} className="relative rounded-3xl overflow-hidden hover-lift" data-testid={`public-chapter-${c.code}`}>
                <div className="h-28 relative overflow-hidden">
                  <img src={c.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070707] to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: c.tint }} />
                  <div className="absolute inset-x-0 bottom-3 px-4 flex items-end justify-between">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: c.tint }}>Chapter {idx + 1}</div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50">{c.period}</div>
                  </div>
                </div>
                <div className="glass rounded-b-3xl p-5">
                  <div className="font-display text-xl tracking-tight text-white">{c.title}</div>
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50 mt-1">{c.subtitle}</div>
                  <div className="mt-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
                    {c.milestones?.length || 0} milestones on record
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chain of Trust — Credentials */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <SectionHeader eyebrow="Chain of Trust · Verifications" title="Every stamp behind the bearer." />
        <div className="mt-6 glass-strong rounded-3xl p-6 md:p-8">
          <div className="divide-y divide-white/5">
            {(data.credentials || []).map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center py-4">
                <div className="col-span-1 md:col-span-1">
                  <ShieldCheck size={16} className="text-[#00e5ff]" />
                </div>
                <div className="col-span-11 md:col-span-6 text-white text-sm">{c.name}</div>
                <div className="col-span-6 md:col-span-3 text-white/60 text-xs">Issued by {c.issuer}</div>
                <div className="col-span-6 md:col-span-2 md:text-right font-mono text-[10px] tracking-[0.2em] uppercase text-white/50">{c.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
        <div className="glass-strong rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">A verified record for every creator.</div>
            <div className="font-display text-2xl md:text-3xl tracking-tight text-white mt-2">
              Not a profile. Not a résumé. A verified identity that follows you for life.
            </div>
          </div>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 px-6 py-3.5 rounded-full text-sm font-medium">
            Claim your ANCRID <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 border-t border-white/5 grid md:grid-cols-3 items-center gap-6">
        <div className="font-mono tracking-[0.24em] uppercase text-white/40 text-xs">© 2026 ANCR · ANCRID™</div>
        <div className="flex items-center justify-center">
          <img
            src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/0j1q4by9_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png"
            alt="ANCR" className="h-9 opacity-80" />
        </div>
        <div className="font-mono tracking-[0.2em] uppercase text-white/40 text-xs md:text-right">Part of the ANCR Ecosystem</div>
      </footer>
    </div>
  );
}

function CornerMark({ className = "" }) {
  return (
    <div className={`absolute ${className} pointer-events-none`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M2 8V2h6" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function RecordField({ k, v, mono, tint }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/40">{k}</div>
      <div
        className={`text-sm mt-1 ${mono ? "font-mono" : ""}`}
        style={{ color: tint || "#fff" }}
      >
        {v || "—"}
      </div>
    </div>
  );
}

function SignalCard({ label, value }) {
  const v = value || 0;
  return (
    <div className="glass rounded-3xl p-6 flex items-center gap-5 hover-lift">
      <div className="relative w-16 h-16 shrink-0">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <defs>
            <linearGradient id={`sig-${label}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="60%" stopColor="#8a2be2" />
              <stop offset="100%" stopColor="#ff6d00" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
          <circle
            cx="32" cy="32" r="26"
            stroke={`url(#sig-${label})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={2 * Math.PI * 26}
            strokeDashoffset={2 * Math.PI * 26 - (v / 100) * (2 * Math.PI * 26)}
            transform="rotate(-90 32 32)"
          />
        </svg>
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">{label}</div>
        <div className="font-display text-3xl text-white tracking-tight mt-1">
          {v}<span className="text-white/40 text-base">/100</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap border-b border-white/5 pb-4">
      <div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">{eyebrow}</div>
        <div className="font-display text-2xl md:text-3xl tracking-tight text-white mt-1">{title}</div>
      </div>
    </div>
  );
}
