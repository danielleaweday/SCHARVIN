import React from "react";
import { useParams } from "react-router-dom";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { MODULES, openModule } from "@/lib/modules";
import { Section } from "@/components/common/Primitives";
import { Sparkles, Coins, Rocket, Play, Radio, Bell } from "lucide-react";

/** Content pack for each Coming-Soon module: features + tagline + hero imagery. */
const CONTENT = {
  Vaulta: {
    color: "#EAB308",
    hero: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=1920&h=800&fit=crop",
    tagline: "The financial layer of the ANCR ecosystem.",
    kicker: "Track royalties, model advances, own your business.",
    features: [
      { icon: Coins, title: "Royalty Dashboard",      text: "Live view of streaming, publishing, and sync income across every ANCR release." },
      { icon: Coins, title: "Budget Assignments",     text: "Faculty-authored financial exercises — with real numbers, real outcomes." },
      { icon: Coins, title: "Contract Modeling",      text: "Model publishing advances, split scenarios, and label offers before you sign." },
      { icon: Coins, title: "Financial Literacy",     text: "Curriculum + AIAH assistant tuned to a creator's cash flow reality." },
    ],
  },
  ANCRLaunch: {
    color: "#F97316",
    hero: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&h=800&fit=crop",
    tagline: "From student to working professional.",
    kicker: "Career readiness, employer viewings, and placement — engineered.",
    features: [
      { icon: Rocket, title: "Graduation Dashboard", text: "Every requirement between now and graduation, live-updated from ANCRA + ecosystem." },
      { icon: Rocket, title: "Employer Viewing",     text: "Curated employer sessions where students showcase to labels, publishers, and studios." },
      { icon: Rocket, title: "Resume + Reel",        text: "Auto-assembled from ANCRID™ Booking Packet + ANCRWAV™ release history." },
      { icon: Rocket, title: "Placement Ops",        text: "Faculty-brokered placements, internships, and paid opportunities inside the ecosystem." },
    ],
  },
  ANCRVIEW: {
    color: "#EF4444",
    hero: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920&h=800&fit=crop",
    tagline: "Cinematic long-form video for the ecosystem.",
    kicker: "Masterclasses, showcases, live streams — MasterClass-quality, ANCR-native.",
    features: [
      { icon: Play, title: "Recorded Masterclasses", text: "Every ANCR Master Session™ archived and searchable — with chaptered transcripts." },
      { icon: Play, title: "Student Showcases",      text: "Portfolio Panels, Live Critiques, and Cohort showcases filmed in-studio." },
      { icon: Play, title: "Live Streams",           text: "Industry sessions streamed live to cohorts and alumni — replays for the network." },
      { icon: Play, title: "Recommendation Engine",  text: "AIAH pairs videos to your journey — never a random feed." },
    ],
  },
  ANCRWAV: {
    color: "#06B6D4",
    hero: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=800&fit=crop",
    tagline: "The release pipeline for every ANCR creator.",
    kicker: "Distribute to every major DSP. Own the whole stack.",
    features: [
      { icon: Radio, title: "One-Click Release",       text: "Push mastered songs from ANCRLAB™ + INHEIRA™ direct to Spotify, Apple, Tidal, Amazon." },
      { icon: Radio, title: "Streaming Analytics",     text: "Realtime listeners, playlist adds, geography — no third-party tools required." },
      { icon: Radio, title: "Class Compilations",      text: "Cohort albums, guest weeks, and CCDP-branded compilations distributed as one product." },
      { icon: Radio, title: "Direct-to-Fan",           text: "Sell exclusives, unreleased demos, and behind-the-scenes to your ANCR audience." },
    ],
  },
};

export default function ComingSoonModule() {
  const { name } = useParams();
  const meta = MODULES[name];
  const c = CONTENT[name] || {};

  return (
    <ModuleShell current={name}>
      {/* Cinematic hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="relative h-[52vh] w-full">
          <img src={c.hero} className="absolute inset-0 h-full w-full object-cover opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
          <div className="absolute inset-0 flex items-end px-6 md:px-10 pb-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]"
                   style={{ borderColor: `${c.color}55`, color: c.color, background: `${c.color}12` }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                Coming soon · Preview
              </div>
              <h1 className="mt-5 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
                {meta.name}<span className="text-[16px] text-ancr-dim align-top">™</span>
              </h1>
              <div className="mt-4 font-serif italic text-2xl text-ancr-dim max-w-xl">{c.tagline}</div>
              <div className="mt-2 font-mono text-[12px] tracking-wider text-ancr-mute uppercase">{c.kicker}</div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button data-testid="notify-me" className="ancr-btn ancr-btn-primary"><Bell size={12} /> Notify me at launch</button>
                <button className="ancr-btn ancr-btn-ghost">Read the spec</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current={name} />

        {/* Feature grid */}
        <section>
          <Section eyebrow="Feature overview" title={<span><em className="italic text-ancr-dim">What</em> {meta.name}™ will do</span>} />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(c.features || []).map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="ancr-card p-6">
                  <div className="rounded-full border border-white/10 p-2 inline-flex" style={{ borderColor: `${c.color}55` }}>
                    <Icon size={16} style={{ color: c.color }} />
                  </div>
                  <div className="mt-4 font-serif text-2xl leading-tight">{f.title}</div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ancr-dim">{f.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline mock */}
        <section>
          <Section eyebrow="Release timeline" title="On the runway" />
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { p: "Spec", d: "Complete", state: "done" },
              { p: "Design", d: "Live prototype", state: "done" },
              { p: "Engineering", d: "In progress", state: "current" },
              { p: "Launch", d: "TBA", state: "next" },
            ].map((m, i) => (
              <div key={i} className="ancr-card p-5">
                <div className="flex items-center justify-between">
                  <div className="ancr-label">Phase {i + 1}</div>
                  <span className={`h-1.5 w-1.5 rounded-full ${m.state === "done" ? "bg-emerald-400" : m.state === "current" ? "" : "bg-white/20"}`}
                        style={m.state === "current" ? { background: c.color, boxShadow: `0 0 10px ${c.color}` } : {}} />
                </div>
                <div className="mt-2 font-serif text-xl">{m.p}</div>
                <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">{m.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AI teaser */}
        <section className="ancr-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: c.color }} />
            <div className="ancr-label" style={{ color: c.color }}>AIAH™ inside {meta.name}™</div>
          </div>
          <div className="mt-3 font-serif text-2xl leading-snug text-ancr-dim">
            When {meta.name}™ ships, AIAH will already know your entire journey — the module will feel like it's been running with you the whole time.
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}
