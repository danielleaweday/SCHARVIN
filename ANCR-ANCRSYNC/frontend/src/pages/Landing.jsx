import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Globe2,
  Radio,
  CalendarClock,
  BadgeCheck,
  Layers,
  MessageSquare,
} from "lucide-react";

const ANCRSYNC_LOGO =
  "https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/5qxf1erx_ChatGPT%20Image%20Jul%206%2C%202026%2C%2009_34_29%20PM.png";
const ANCR_LOGO =
  "https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/xhovgcty_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png";

const Feature = ({ icon: Icon, title, body }) => (
  <div className="glass rounded-2xl p-6 hover:border-white/[0.14] transition-colors">
    <Icon size={20} strokeWidth={1.5} className="text-[#007AFF] mb-4" />
    <div className="font-display text-lg text-zinc-50 mb-2">{title}</div>
    <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
  </div>
);

const HERO_BG =
  "https://images.unsplash.com/photo-1707730376818-a7a02fe896d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMGRhcmslMjBnbGFzcyUyMHNwaGVyZXxlbnwwfHx8fDE3ODMzODk4Njh8MA&ixlib=rb-4.1.0&q=85";

const STUDIO_BG =
  "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMHByb2R1Y3Rpb24lMjBzdHVkaW8lMjBkYXJrfGVufDB8fHx8MTc4MzM4OTg2OHww&ixlib=rb-4.1.0&q=85";

const COMMUNITY_BG =
  "https://images.unsplash.com/photo-1612544409025-e1f6a56c1152?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxjcmVhdG9ycyUyMGNvbGxhYm9yYXRpbmclMjBzdHVkaW98ZW58MHx8fHwxNzgzMzg5ODY4fDA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-black text-zinc-50 relative z-[2]">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => nav("/")}
            data-testid="landing-logo"
          >
            <div className="bg-black border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center">
              <img
                src={ANCRSYNC_LOGO}
                alt="ANCRSync"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="hidden sm:inline text-[10px] tracking-overline text-zinc-500">
              Creative OS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-50 transition-colors">
              Features
            </a>
            <a href="#studios" className="hover:text-zinc-50 transition-colors">
              Studios
            </a>
            <a href="#passport" className="hover:text-zinc-50 transition-colors">
              Passport
            </a>
            <a href="#ecosystem" className="hover:text-zinc-50 transition-colors">
              Ecosystem
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-testid="landing-signin-btn"
              onClick={() => nav("/login")}
              className="text-sm text-zinc-400 hover:text-zinc-50 px-4 py-2 rounded-full transition-colors"
            >
              Sign in
            </button>
            <button
              data-testid="landing-signup-btn"
              onClick={() => nav("/signup")}
              className="text-sm bg-zinc-50 text-zinc-950 hover:bg-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="mb-10"
            >
              <img
                src={ANCRSYNC_LOGO}
                alt="ANCRSync"
                data-testid="hero-logo"
                className="h-40 sm:h-52 lg:h-64 w-auto object-contain drop-shadow-[0_0_80px_rgba(139,92,246,0.35)]"
              />
            </motion.div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dot-pulse" />
              <span className="text-[11px] tracking-overline text-zinc-300">
                Now in preview · Creative OS v1
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[88px] leading-[0.95] tracking-tighter font-medium text-zinc-50">
              Connect.
              <br />
              <span className="text-zinc-500">Collaborate.</span>
              <br />
              Create.
            </h1>
            <p className="mt-8 text-lg text-zinc-400 max-w-2xl leading-relaxed">
              ANCRSync™ is the world's first{" "}
              <span className="text-zinc-100">
                Creative Collaboration Operating System
              </span>
              . One connected environment for studios, sessions, mentorship,
              feedback, and a verified record of every creative move you make.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                data-testid="hero-primary-cta"
                onClick={() => nav("/signup")}
                className="group bg-[#007AFF] hover:bg-blue-500 text-white px-6 py-3 rounded-full font-medium text-sm accent-glow flex items-center gap-2 transition-all"
              >
                Enter the OS
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
              <button
                data-testid="hero-secondary-cta"
                onClick={() => nav("/login")}
                className="text-zinc-300 hover:text-zinc-50 px-6 py-3 rounded-full font-medium text-sm border border-white/10 hover:border-white/20 transition-colors"
              >
                Sign in
              </button>
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {[
                ["12k+", "Creators"],
                ["380", "Institutions"],
                ["64", "Countries"],
                ["1.2M", "Passport entries"],
              ].map(([k, v]) => (
                <div key={v}>
                  <div className="font-display text-3xl text-zinc-50">{k}</div>
                  <div className="text-[11px] tracking-overline text-zinc-500 mt-1">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <div className="text-[11px] tracking-overline text-[#007AFF] mb-3">
            The operating system
          </div>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium">
            Every creative primitive, in one connected surface.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature
            icon={Layers}
            title="Creative Workspaces™"
            body="Tasks, files, milestones, versions, comments, approvals — everything about a project lives together, connected."
          />
          <Feature
            icon={Radio}
            title="Shared Studios™"
            body="Ten live digital studios — Songwriting, Recording, Film, Animation, Photography, Brand, and more. Drop in and create."
          />
          <Feature
            icon={CalendarClock}
            title="Shared Sessions™"
            body="Schedule sessions with video, whiteboard, notes, and an AI meeting assistant that summarizes and extracts action items."
          />
          <Feature
            icon={MessageSquare}
            title="Shared Feedback™"
            body="Replace endless email chains. Comment, annotate, approve, and version-compare. Voice feedback supported."
          />
          <Feature
            icon={Globe2}
            title="Global Collaboration™"
            body="Find collaborators by country, city, discipline, and availability across an interactive world of creators."
          />
          <Feature
            icon={Sparkles}
            title="AI Collaboration Intelligence™"
            body="Meeting summaries, skill matching, mentor matching, deadline predictions. AI helps teams — never replaces them."
          />
        </div>
      </section>

      {/* Studios */}
      <section id="studios" className="relative py-24">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${STUDIO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[11px] tracking-overline text-[#007AFF] mb-3">
              Shared Studios™
            </div>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium">
              Ten live studios. One operating layer.
            </h2>
            <p className="mt-6 text-zinc-400 leading-relaxed">
              Songwriting, Recording, Production, Film, Animation, Photography,
              Podcast, Brand, Creative Strategy, and Innovation. Every studio
              supports real-time collaboration — from the first sketch to the
              final master.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-zinc-300">
              {[
                "Songwriting",
                "Recording",
                "Production",
                "Film",
                "Animation",
                "Photography",
                "Podcast",
                "Brand",
                "Creative Strategy",
                "Innovation",
              ].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#007AFF]" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "The Lyric Room", tag: "Songwriting · Live" },
              { title: "Beat Lab", tag: "Production · 8 in" },
              { title: "Frame One", tag: "Film · Scheduled" },
              { title: "Keyframe", tag: "Animation · Live" },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass rounded-2xl p-5 h-40 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dot-pulse" />
                  <span className="text-[10px] tracking-overline text-zinc-500">
                    {s.tag}
                  </span>
                </div>
                <div className="font-display text-lg text-zinc-50">
                  {s.title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Passport */}
      <section id="passport" className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 mb-6">
                <BadgeCheck size={12} className="text-[#F59E0B]" />
                <span className="text-[11px] tracking-overline text-zinc-300">
                  Unique to ANCR
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium">
                Creative Passport™
              </h2>
              <p className="mt-6 text-zinc-400 leading-relaxed">
                Every collaboration, mentorship, session, and project becomes
                part of your professional history — automatically. Verified
                evidence of learning inside CCDP. Verified evidence of experience
                everywhere else. A bridge between education and industry.
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  data-testid="passport-cta"
                  onClick={() => nav("/signup")}
                  className="bg-[#F59E0B] hover:bg-amber-400 text-black px-6 py-3 rounded-full font-medium text-sm transition-colors"
                >
                  Start your Passport
                </button>
              </div>
            </div>
            <div className="font-mono text-xs space-y-4">
              {[
                {
                  d: "2026.02.18",
                  t: "Session · Beat Lab",
                  s: "Verified · Producer",
                },
                {
                  d: "2026.02.14",
                  t: "Mentorship · Berklee Online",
                  s: "Verified · Institution",
                },
                {
                  d: "2026.02.09",
                  t: "Project · Aurora EP",
                  s: "Verified · Label",
                },
                {
                  d: "2026.02.02",
                  t: "Studio · The Lyric Room",
                  s: "Verified · Songwriter",
                },
              ].map((r) => (
                <div
                  key={r.d}
                  className="flex items-center justify-between border-l-2 border-[#F59E0B]/40 pl-4 py-2"
                >
                  <div>
                    <div className="text-zinc-500">{r.d}</div>
                    <div className="text-zinc-100 text-sm font-sans">{r.t}</div>
                  </div>
                  <div className="text-[10px] text-[#F59E0B] tracking-overline">
                    {r.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-[11px] tracking-overline text-[#007AFF] mb-3">
          The ANCR ecosystem
        </div>
        <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium max-w-3xl">
          One identity. One ecosystem. Infinite collaboration.
        </h2>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { n: "ANCRLAB™", d: "Create together" },
            { n: "INHEIRA™", d: "Capture ownership" },
            { n: "ANCRSync™", d: "Collaborate globally", active: true },
            { n: "Vaulta™", d: "Track finances" },
            { n: "ANCRLaunch™", d: "Launch careers" },
            { n: "ANCRID™", d: "Verified identity" },
          ].map((p) => (
            <div
              key={p.n}
              className={`glass rounded-2xl p-4 ${
                p.active ? "border-[#007AFF]/40 accent-glow" : ""
              }`}
            >
              <div className="font-display text-sm text-zinc-50">{p.n}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(${COMMUNITY_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black" />
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="font-display text-4xl sm:text-6xl tracking-tighter font-medium">
            The creative work of your life
            <br />
            <span className="text-zinc-500">deserves an operating system.</span>
          </h2>
          <div className="mt-10">
            <button
              data-testid="cta-primary"
              onClick={() => nav("/signup")}
              className="bg-zinc-50 text-zinc-950 hover:bg-white px-8 py-4 rounded-full font-medium text-sm transition-colors"
            >
              Create your account
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-black">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          {/* Brand tagline */}
          <div className="flex items-center justify-center mb-6">
            <img
              src={ANCRSYNC_LOGO}
              alt="ANCRSync"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <div className="font-display text-xl md:text-2xl text-zinc-100 tracking-tight leading-relaxed">
            Collaborate. <span className="text-zinc-500">Create.</span>{" "}
            <span className="text-zinc-300">Build Together.</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-12">
            <div className="h-px flex-1 max-w-[80px] bg-white/[0.08]" />
            <span className="text-[10px] tracking-overline text-zinc-500">
              Part of the ANCR Ecosystem
            </span>
            <div className="h-px flex-1 max-w-[80px] bg-white/[0.08]" />
          </div>

          <div
            className="flex items-center justify-center gap-8 md:gap-14 flex-wrap mb-6"
            data-testid="ecosystem-logos"
          >
            <div className="bg-black border border-white/10 rounded-2xl px-6 py-3">
              <img
                src={ANCRSYNC_LOGO}
                alt="ANCRSync"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </div>
            <div className="bg-black border border-white/10 rounded-2xl px-6 py-3">
              <img
                src={ANCR_LOGO}
                alt="ANCR"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-[11px] tracking-overline text-zinc-500">
            Discover. Develop. Deploy.
          </div>

          <div className="mt-12 border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
            <div className="font-mono">© 2026 ANCR</div>
            <div className="flex gap-6">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
