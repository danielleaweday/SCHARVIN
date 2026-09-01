import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, Globe, BookCheck, Bookmark, FileText, ShieldCheck, Plane, Eye, EyeOff,
} from "lucide-react";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Ring, Disclaimer, fadeUp, staggerContainer } from "@/components/common";

export default function MyPassport() {
  const [d, setD] = useState(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { api.get("/passport").then((r) => setD(r.data)); }, []);
  if (!d) return <Loader label="Loading your Passport" />;
  const u = d.user;

  return (
    <div data-testid="my-passport-page">
      <PageHeader eyebrow="My Passport" title="Your global-readiness record"
        subtitle="Identity provided by ANCRID. Travel, cultural and readiness data owned by ANCR Passport. Sensitive values are masked."
        testid="passport-header" />

      {/* Passport card */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-[#131B2F] via-[#0B1021] to-[#05050A] p-8" data-testid="passport-card">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-magenta/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <img src={u.avatar} alt={u.name} className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/15" data-testid="passport-photo" />
              <div className="flex-1">
                <div className="flex items-center gap-2"><Pill tone="cyan">ANCRID Verified</Pill><span className="font-mono-p text-[11px] text-white/45">{u.ancrid.ancrid_id}</span></div>
                <h2 className="mt-2 font-display text-3xl font-700 text-white">{u.name}</h2>
                <div className="mt-1 text-sm text-white/60">{u.discipline} · {u.role}</div>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 font-mono-p text-xs text-white/60 sm:grid-cols-3">
                  <div><span className="text-white/35">Home</span><br />{u.home_country}</div>
                  <div><span className="text-white/35">Citizenship</span><br />{u.citizenship}</div>
                  <div><span className="text-white/35">Preferred lang</span><br />{u.preferred_language}</div>
                </div>
              </div>
              <div className="text-center"><Ring value={u.global_readiness_score} size={92} sub="readiness" /></div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassCard className="h-full p-6" data-testid="ancrid-integration">
            <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">ANCRID Integration</h3></div>
            <p className="text-xs leading-relaxed text-white/55">{u.ancrid.note}</p>
            <div className="mt-4 space-y-2">
              {u.ancrid.shared_fields.map((f) => (
                <div key={f} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs"><span className="capitalize text-white/70">{f}</span><Pill tone="green">synced</Pill></div>
              ))}
            </div>
            <div className="mt-3 font-mono-p text-[10px] text-white/35">Simulated SSO · connected {u.ancrid.connected_at}</div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Documents (masked) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" data-testid="passport-documents">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-violet" /><h3 className="font-display text-lg font-600 text-white">Travel documents</h3></div>
            <button onClick={() => setReveal(!reveal)} data-testid="reveal-toggle" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] text-white/60">{reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {reveal ? "Mask" : "Reveal"}</button>
          </div>
          <div className="space-y-2.5">
            {d.documents.map((doc) => (
              <div key={doc.label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4">
                <div><div className="text-sm font-600 text-white">{doc.label}</div><div className="font-mono-p text-xs text-white/50">{reveal ? doc.masked.replace(/•/g, "4") : doc.masked} · exp {doc.expires}</div></div>
                <Pill tone={doc.status === "Valid" ? "green" : "amber"}>{doc.status}</Pill>
              </div>
            ))}
          </div>
          <Disclaimer className="mt-4" text="Passport numbers are never shown in full on general screens. This build uses fictional demonstration documents." />
        </GlassCard>

        <GlassCard className="p-6" data-testid="visa-records">
          <div className="mb-3 flex items-center gap-2"><Plane className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">Visa records & experiences</h3></div>
          <div className="mb-4 space-y-2">
            {d.visa_records.map((v, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-3"><div><div className="text-sm font-600 text-white">{v.country}</div><div className="text-xs text-white/50">{v.type}</div></div><Pill tone="amber">{v.status}</Pill></div>
            ))}
          </div>
          <div className="text-xs uppercase tracking-widest text-white/40">International experience</div>
          <div className="mt-2 space-y-1.5">
            {d.international_experiences.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/70"><Globe className="h-3.5 w-3.5 text-violet" /> {e.country} — {e.purpose} <span className="font-mono-p text-xs text-white/40">({e.year})</span></div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Badges / courses / saved */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="p-6" data-testid="readiness-badges">
          <div className="mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-amber" /><h3 className="font-display text-lg font-600 text-white">Country-readiness badges</h3></div>
          {d.badges.length === 0 ? <p className="text-sm text-white/45">Complete a Culture School course to earn your first badge.</p> : (
            <div className="flex flex-wrap gap-3">
              {d.badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-2xl border border-amber/25 bg-amber/8 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber to-magenta"><Award className="h-6 w-6 text-white" /></div><span className="text-xs font-600 text-white">{b.label}</span></div>
              ))}
            </div>
          )}
        </GlassCard>
        <GlassCard className="p-6" data-testid="completed-courses">
          <div className="mb-3 flex items-center gap-2"><BookCheck className="h-5 w-5 text-cyan" /><h3 className="font-display text-lg font-600 text-white">Completed courses</h3></div>
          {d.completed_courses.length === 0 ? <p className="text-sm text-white/45"><Link to="/culture-school" className="text-cyan hover:underline">Start a course →</Link></p> : (
            <div className="space-y-2">{d.completed_courses.map((c, i) => (<div key={i} className="flex items-center gap-2 text-sm text-white/75"><BookCheck className="h-4 w-4 text-emerald-400" /> {c.title}</div>))}</div>
          )}
        </GlassCard>
        <GlassCard className="p-6" data-testid="saved-destinations">
          <div className="mb-3 flex items-center gap-2"><Bookmark className="h-5 w-5 text-violet" /><h3 className="font-display text-lg font-600 text-white">Saved destinations</h3></div>
          {d.saved_destinations.length === 0 ? <p className="text-sm text-white/45"><Link to="/explore" className="text-cyan hover:underline">Explore & save →</Link></p> : (
            <div className="flex flex-wrap gap-2">{d.saved_destinations.map((s) => (<Link key={s.id} to={`/explore/${s.id}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:border-cyan/40">{s.flag} {s.country}</Link>))}</div>
          )}
        </GlassCard>
      </div>

      {/* Emergency + accessibility */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" data-testid="emergency-contacts">
          <h3 className="mb-3 font-display text-lg font-600 text-white">Emergency contacts</h3>
          <div className="space-y-2">{u.emergency_contacts.map((c) => (<div key={c.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-3"><div><div className="text-sm font-600 text-white">{c.name} {c.primary && <Pill tone="cyan" className="ml-1">Primary</Pill>}</div><div className="text-xs text-white/50">{c.relationship}</div></div><span className="font-mono-p text-xs text-white/60">{c.phone_masked}</span></div>))}</div>
        </GlassCard>
        <GlassCard className="p-6" data-testid="accessibility-prefs">
          <h3 className="mb-3 font-display text-lg font-600 text-white">Accessibility & languages</h3>
          <div className="mb-3 flex flex-wrap gap-2">{u.accessibility_preferences.map((a) => <Pill key={a} tone="violet">{a}</Pill>)}</div>
          <div className="text-xs uppercase tracking-widest text-white/40">Languages spoken</div>
          <div className="mt-2 flex flex-wrap gap-2">{u.languages_spoken.map((l) => <Pill key={l} tone="muted">{l}</Pill>)}</div>
        </GlassCard>
      </div>
    </div>
  );
}
