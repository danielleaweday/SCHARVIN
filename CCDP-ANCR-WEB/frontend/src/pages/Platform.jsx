import * as Icons from "lucide-react";
import { ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Seo } from "../components/Seo";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";
import { EcosystemExperience } from "../components/ecosystem/EcosystemExperience";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { PLATFORMS, BRANCHES, ASSETS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const EASE = [0.22, 1, 0.36, 1];

export default function Platform() {
  const { openInquiry, openBriefing } = useInquiry();
  const platformCount = PLATFORMS.filter((p) => !p.os).length;
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="The ANCR Platform" description="ANCR is the education operating system that unifies every CCDP platform into one connected identity — powering learning, collaboration, credentials, and career readiness across the creative journey." />
      <Navbar />

      {/* Hero */}
      <section id="top" data-testid="platform-hero" className="grain relative overflow-hidden pt-[72px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{ backgroundImage: `url(${ASSETS.mesh})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ccdp-black/40 via-ccdp-black/70 to-ccdp-black" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="overline flex items-center gap-3 text-ccdp-cream/70">
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> The Platform
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.0] tracking-tight text-ccdp-white sm:text-6xl lg:text-[4.5rem]">
            An education{" "}
            <span className="text-gradient">operating system.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.22 }}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-ccdp-cream/75">
            CCDP unites schools, platforms, and credentials into one comprehensive
            ecosystem of intelligent platforms — unified by ANCR — that power
            every stage of the creative journey.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.34 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button type="button" onClick={openBriefing} data-testid="platform-briefing-btn"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5">
              Schedule an Executive Briefing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={() => openInquiry("deck")} data-testid="platform-deck-btn"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-ccdp-cream transition-colors hover:border-white/60 hover:bg-white/5">
              <FileText className="h-4 w-4" /> Request the Partnership Deck
            </button>
          </motion.div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[[String(platformCount), "Integrated platforms"], [String(BRANCHES.length), "Ecosystem pillars"], ["1", "Unified identity"]].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-4xl font-extrabold tracking-tight text-gradient">{v}</div>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ccdp-cream/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office analogy framing */}
      <section className="border-y border-white/10 section-rich-alt py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="max-w-4xl font-display text-2xl font-medium leading-snug tracking-tight text-ccdp-cream/85 md:text-3xl">
              The way Microsoft Office is not a single app — but Word, Excel,
              PowerPoint, Teams and more working as one —{" "}
              <span className="text-gradient">CCDP is a full ecosystem</span>{" "}
              of platforms working as one to build the future of creative
              education.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive ecosystem */}
      <section id="explore" className="grain relative overflow-hidden section-rich py-24 text-ccdp-cream md:py-32">
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Explore the ecosystem.{" "}
              <span className="text-gradient">Every system, connected.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12">
              <EcosystemExperience />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Per-branch breakdown */}
      <section className="section-rich-alt py-24 text-ccdp-cream md:py-32">
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50">
              <span className="inline-block h-px w-8 bg-white/25" /> Three pillars
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl">
              Education. Technology. Creative Economy.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {BRANCHES.map((b) => (
              <Reveal key={b.id} delay={0.1}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                    <h3 className="font-display text-2xl font-bold tracking-tight text-ccdp-white">{b.label}</h3>
                  </div>
                  <p className="mt-2 text-sm text-ccdp-cream/60">{b.desc}</p>
                  <Stagger className="mt-6 space-y-3">
                    {PLATFORMS.filter((p) => p.branch === b.id).map((p) => {
                      const Icon = Icons[p.icon] || Icons.Boxes;
                      return (
                        <StaggerItem key={p.id}>
                          <div data-testid={`branch-platform-${p.id}`} className="flex items-start gap-3 border-t border-white/10 pt-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5 p-1">
                              {p.logo ? (
                                <img src={p.logo} alt={p.name} draggable="false" className="max-h-full max-w-full object-contain" />
                              ) : (
                                <Icon className="h-4 w-4 text-ccdp-cream" />
                              )}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-base font-semibold tracking-tight text-ccdp-white">{p.name}</span>
                                {p.os && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ccdp-cream">OS</span>}
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-ccdp-cream/55">{p.short}</p>
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard showcase */}
      <section className="section-rich py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-white/10">
              <img src={ASSETS.dashboard} alt="The CCDP platform experience" className="w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </div>
  );
}
