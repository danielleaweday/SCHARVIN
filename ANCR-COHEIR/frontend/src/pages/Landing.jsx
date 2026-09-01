import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, Compass, Rocket, Users, Handshake, Globe2, Award } from "lucide-react";
import CoheirLogo from "@/components/coheir/CoheirLogo";
import AncrBadge from "@/components/coheir/AncrBadge";

const marquee = [
  "GRAMMY-WINNING PRODUCERS", "A&R DIRECTORS", "HIT SONGWRITERS", "MIX ENGINEERS",
  "ENTERTAINMENT ATTORNEYS", "MUSIC PUBLISHERS", "CREATIVE DIRECTORS", "ARTIST MANAGERS",
  "FILM COMPOSERS", "LABEL EXECUTIVES",
];

const pillars = [
  { icon: Users, kicker: "LEAD", title: "Verified Industry Leaders",
    body: "Every mentor arrives with a verified ANCRID™ credential — no directories, no unknowns." },
  { icon: Compass, kicker: "MENTOR", title: "Continuous Supervision",
    body: "Faculty and industry work side-by-side across every phase of a student's journey." },
  { icon: Sparkles, kicker: "DEVELOP", title: "Creative Supervision",
    body: "Portfolio reviews, writing camps, studio sessions and critiques feed directly into ANCRID™." },
  { icon: Rocket, kicker: "LAUNCH", title: "From Cohort to Career",
    body: "Opportunities, recommendations and creative teams operate as one continuous experience." },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Top nav */}
      <div className="fixed top-0 inset-x-0 z-40 header-glass">
        <div className="max-w-[1500px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <CoheirLogo variant="wordmark" size={38} />
            <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-3 ml-1">
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                Industry Leadership Network
              </div>
              <AncrBadge variant="pill" />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-outline text-xs py-2" data-testid="landing-signin-btn">Sign in</Link>
            <button onClick={() => navigate("/login?tab=register")} className="btn-primary text-xs py-2" data-testid="landing-join-btn">Join COHEIR</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-[140px] pb-24">
        <div className="aurora" />
        <div className="grain absolute inset-0" />
        <div className="max-w-[1500px] mx-auto px-8 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-6 flex-wrap">
            <BadgeCheck className="w-4 h-4 text-[#00F0FF] verified-dot" />
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-400">
              The Industry Leadership Network
            </div>
            <AncrBadge variant="pill" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.05 }}
            className="max-w-3xl mb-4">
            <CoheirLogo variant="full" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-8 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            COHEIR™ is not a directory. It is the professional operating system where education and industry
            work together continuously to develop the next generation of creators. Verified faculty, executives,
            artists, engineers, publishers and employers actively teach, supervise, mentor, evaluate, and launch
            students throughout their journey.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-3">
            <button onClick={() => navigate("/login")} className="btn-primary flex items-center gap-2" data-testid="landing-primary-cta">
              Enter COHEIR <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/login?demo=1")} className="btn-outline flex items-center gap-2" data-testid="landing-demo-cta">
              Explore the demo
            </button>
            <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase ml-2 hidden md:block">
              22 verified industry leaders · 6 cohorts · 8 live sessions
            </div>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="mt-20 overflow-hidden border-y border-white/[0.06] py-4 relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap font-mono text-[11px] tracking-[0.4em] uppercase text-zinc-500">
            {[...marquee, ...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-4">
                <span className="w-1 h-1 rounded-full bg-[#00F0FF]" />
                {m}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-[1500px] mx-auto px-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-3">The COHEIR standard</div>
            <h2 className="wordmark text-4xl md:text-5xl text-white max-w-3xl leading-none">
              Industry doesn't begin after graduation. It begins the day you arrive.
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-panel p-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-gradient-cohesion grid place-items-center text-black mb-5">
                <p.icon className="w-4 h-4" strokeWidth={2.4} />
              </div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-2">{p.kicker}</div>
              <div className="wordmark text-xl text-white leading-tight mb-2">{p.title}</div>
              <div className="text-zinc-500 text-sm leading-relaxed">{p.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1500px] mx-auto px-8 pb-24">
        <div className="glass-panel px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "22+", l: "Verified Professionals", icon: Users },
            { n: "9", l: "Creative Disciplines", icon: Award },
            { n: "6", l: "Active Cohorts", icon: Globe2 },
            { n: "100%", l: "ANCRID™ Verified", icon: Handshake },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-4">
              <s.icon className="w-6 h-6 text-[#00F0FF]" />
              <div>
                <div className="wordmark text-4xl text-white">{s.n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem strip */}
      <section className="max-w-[1500px] mx-auto px-8 pb-32">
        <div className="glass-panel p-10 grid lg:grid-cols-2 gap-10 items-center relative overflow-hidden">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-3">Deep ANCR Ecosystem Integration</div>
            <h3 className="wordmark text-3xl md:text-4xl text-white leading-tight mb-4">
              COHEIR™ reads from and writes to the ecosystem — never duplicates it.
            </h3>
            <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
              Every approved review, recommendation, and creative milestone permanently strengthens a student's
              ANCRID™. Portfolios flow from ANCRLAB™. Collaboration flows from ANCRSync™. Publishing metadata is
              inherited from INHEIRA™. Ownership from Vaulta™. Ventures from ANCRLaunch™.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["ANCRID™", "ANCRLAB™", "ANCRSync™", "INHEIRA™", "Vaulta™", "ANCRLaunch™", "ANCRA™", "COHEIR™", "CCDP"].map((n) => (
              <div key={n} className={`h-20 rounded-xl border ${n==="COHEIR™" ? "border-[#00F0FF]/50 bg-[#00F0FF]/5" : "border-white/[0.06] bg-white/[0.02]"} grid place-items-center`}>
                <span className={`wordmark text-sm ${n==="COHEIR™" ? "text-[#00F0FF]" : "text-white"}`}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-[1500px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <CoheirLogo variant="wordmark" size={32} />
          <AncrBadge variant="block" />
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} · CCDP · ANCR Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
}
