import React from "react";
import { useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip, StatCell } from "@/components/common/Primitives";
import { ArrowUpRight, ExternalLink, Sparkles, Play, FileText, Waves, Users, Zap, Music, Coins, Rocket, Radio, Fingerprint } from "lucide-react";
import { openModule, MODULES } from "@/lib/modules";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";

const ICONS = {
  ancrlab: Waves, ancrsync: Users, coheir: Zap, inheira: Music,
  vaulta: Coins, ancrlaunch: Rocket, ancrid: Fingerprint,
  ancrview: Play, ancrwav: Radio,
};

const RELATED_LESSONS = {
  ancrlab: [
    { id: "les_prod_01", title: "Sound Design · Building Your Palette", instructor: "Lucas Neri", duration: "38 min" },
    { id: "les_song_01", title: "The First Eight Bars", instructor: "Prof. Bloom", duration: "24 min" },
  ],
  ancrsync: [
    { id: "les_song_02", title: "Prosody of the Chorus", instructor: "Prof. Bloom", duration: "31 min" },
  ],
  inheira: [
    { id: "les_deal_01", title: "The Anatomy of a Publishing Deal", instructor: "Ivy Marsh", duration: "45 min" },
  ],
  coheir: [
    { id: "les_deal_01", title: "The Anatomy of a Publishing Deal", instructor: "Ivy Marsh", duration: "45 min" },
  ],
  default: [
    { id: "les_song_01", title: "The First Eight Bars", instructor: "Prof. Bloom", duration: "24 min" },
  ],
};

const CURRENT_ASSIGNMENTS = {
  ancrlab: [
    { title: "Sound Design palette · 12 patches", due: "Feb 16", priority: "medium" },
    { title: "Master 'Half-Light Room' · v2", due: "Feb 18", priority: "high" },
  ],
  ancrsync: [
    { title: "Writing Room · Nightshift Session 04", due: "Feb 12", priority: "medium" },
  ],
  inheira: [
    { title: "Register splits · 'Cathedral in July'", due: "Feb 14", priority: "high" },
  ],
  coheir: [
    { title: "Portfolio critique prep", due: "Fri", priority: "high" },
  ],
  vaulta: [
    { title: "Budget assignment · Studio time Q1", due: "Feb 20", priority: "low" },
  ],
  default: [{ title: "See dashboard for assignments", due: "—", priority: "low" }],
};

const AI_INSIGHTS = {
  ancrlab: "Two of your projects have been idle 6+ days. Book Studio A for Thursday morning — the room is empty and Ava is free.",
  ancrsync: "Nightshift's chemistry is at 88 (top 15% of active rooms). Consider extending to a full EP arc.",
  inheira: "'Cathedral in July' has a Kobalt publisher inquiry sitting for 3 days. Respond before Friday.",
  coheir: "Prof. Bloom's Thursday 15:00 slot is open — you've had 3 unresolved feedback threads waiting.",
  vaulta: "Your ANCRWAV™ Q4 royalty of $214 is unallocated. Route 40% to studio time, 40% to marketing.",
  ancrlaunch: "Sony Publishing just viewed your ANCRID™. Send your Booking Packet™ within 48 hours to convert.",
  ancrid: "Your Portfolio score jumped +2 to 87. Time to re-issue your Booking Packet™ with the new mix included.",
  ancrview: "Sylvia Massy's session Thursday will unlock the last piece of your Sonic Risk framework.",
  ancrwav: "'Cathedral in July' is climbing 'Emerging CCDP' — release a shortform vertical to ride the momentum.",
};

export default function EcosystemHub() {
  const { module } = useParams();
  const { data: hub } = useSWR(`/ecosystem/${module}`, get);
  if (!hub) return <div className="p-10 font-mono text-[12px] text-ancr-mute">Loading {module}…</div>;

  const Icon = ICONS[hub.module] || Waves;
  const lessons = RELATED_LESSONS[hub.module] || RELATED_LESSONS.default;
  const assignments = CURRENT_ASSIGNMENTS[hub.module] || CURRENT_ASSIGNMENTS.default;
  const insight = AI_INSIGHTS[hub.module] || "AIAH is analysing your ecosystem activity.";

  return (
    <div className="ancr-reveal">
      {/* Cinematic launch hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="ancr-halo ancr-halo-accent -right-32 -top-32 h-[520px] w-[520px]" />
        <div className="px-6 md:px-10 py-14">
          <div className="ancr-label mb-3">Ecosystem Launch · from ANCRA™</div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-5">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
                  <Icon size={30} className="text-[var(--ancra-accent)]" />
                </div>
                <div>
                  <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight">{hub.title}</h1>
                  <div className="mt-2 font-mono text-[11px] text-ancr-dim">{hub.headline}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip>ANCRA · connected</Chip>
              <button
                data-testid={`hub-continue-${hub.module}`}
                onClick={() => openModule(hub.cta_module)}
                className="ancr-btn ancr-btn-ghost"
              >
                Continue where I left off
              </button>
              <button
                onClick={() => openModule(hub.cta_module)}
                data-testid={`hub-launch-${hub.module}`}
                className="ancr-btn ancr-btn-primary"
              >
                Open full {hub.cta_module}™ <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live metrics inline strip */}
      <section className="border-b border-white/[0.06] px-6 md:px-10 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {hub.metrics.map((m, i) => (
            <StatCell key={i} label={m.label} value={m.value} />
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="grid grid-cols-1 gap-6 px-6 md:px-10 py-12 lg:grid-cols-12">
        {/* Recent Activity */}
        <div className="lg:col-span-6">
          <Section eyebrow="Recent activity" title="What moved in this module" />
          <div className="mt-6 space-y-2">
            {hub.activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="ancr-label text-ancr-mute w-24">{a.when}</div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex-1 text-[13.5px]">{a.text}</div>
                <Chip>{a.kind}</Chip>
              </div>
            ))}
          </div>
        </div>

        {/* Current Assignments */}
        <div className="lg:col-span-6">
          <Section
            eyebrow="Current assignments"
            title="Tied to this module"
            right={<Link to="/assignments" className="font-mono text-[10px] uppercase tracking-widest text-ancr-dim hover:text-white flex items-center gap-1">All <ArrowUpRight size={11} /></Link>}
          />
          <div className="mt-6 space-y-2">
            {assignments.map((a, i) => (
              <div key={i} className="ancr-card flex items-center gap-4 p-4">
                <FileText size={14} className="text-ancr-dim" />
                <div className="flex-1">
                  <div className="text-[13.5px]">{a.title}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute">Due {a.due}</div>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wider ${
                  a.priority === "high" ? "text-[var(--ancra-accent)]" :
                  a.priority === "medium" ? "text-amber-300" : "text-ancr-dim"
                }`}>{a.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Lessons */}
        <div className="lg:col-span-6">
          <Section eyebrow="Related lessons" title="Learn while you work" />
          <div className="mt-6 space-y-2">
            {lessons.map((l) => (
              <Link
                key={l.id}
                to={`/lesson/${l.id}`}
                data-testid={`hub-lesson-${l.id}`}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/25 transition"
              >
                <div className="rounded-full border border-white/10 p-2 group-hover:border-white/30">
                  <Play size={12} className="fill-white" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-[15px]">{l.title}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-ancr-mute">{l.instructor} · {l.duration}</div>
                </div>
                <ArrowUpRight size={14} className="text-ancr-dim group-hover:text-white transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="lg:col-span-6">
          <Section eyebrow="AIAH™ insight" title="What matters here right now" />
          <div className="mt-6 ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">Contextual to {hub.cta_module}™</div>
            </div>
            <p className="font-serif text-xl leading-snug text-ancr-dim">{insight}</p>
            <div className="mt-5 flex gap-2">
              <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Act on this</button>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Dismiss</button>
            </div>
          </div>
        </div>
      </section>

      {/* Foot CTA */}
      <section className="border-t border-white/[0.06] bg-black/40 px-6 md:px-10 py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="ancr-label mb-2">Ready to work</div>
            <div className="font-serif text-3xl leading-tight">Everything above syncs back to ANCRA<span className="text-ancr-mute">™</span> as you go.</div>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="ancr-btn ancr-btn-ghost">Return to ANCRA</Link>
            <button onClick={() => openModule(hub.cta_module)} className="ancr-btn ancr-btn-primary" data-testid={`hub-launch-cta-${hub.module}`}>
              Open full {hub.cta_module}™ <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* Ecosystem launcher */}
      <section className="px-6 md:px-10 pb-12">
        <EcosystemLauncher current={hub.cta_module} />
      </section>
    </div>
  );
}
