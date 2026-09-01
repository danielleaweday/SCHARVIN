import * as Icons from "lucide-react";
import { ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Seo } from "../components/Seo";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ParallaxBand } from "../components/ParallaxBand";
import { PLATFORMS, FRAMEWORK_PILLARS, FRAMEWORK_HERO, ASSETS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const CCDP_MARK = "/brand/ccdp-mark.png";
const ANCR_MARK = "/brand/modules/ancr.png";
const DISCOVER_IMG = FRAMEWORK_PILLARS[0].image;
const THRIVE_IMG = FRAMEWORK_HERO;

const byId = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
const ORBIT = ["passport", "ancrid", "coheir", "vaulta", "ancrlaunch", "ancrview", "ancrwav", "ancrd", "inheira", "sovreign"]
  .map((id) => byId[id]).filter(Boolean);

const STAGES = [
  { n: 1, key: "DISCOVER", accent: "#2e7bff" },
  { n: 2, key: "DEVELOP", accent: "#a855f7" },
  { n: 3, key: "CONNECT", accent: "#7a3ff2" },
  { n: 4, key: "DEPLOY", accent: "#f59e0b" },
  { n: 5, key: "THRIVE", accent: "#e0349e" },
];

const Ambient = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full opacity-[0.16] blur-[120px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
    <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full opacity-[0.14] blur-[120px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
    <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full opacity-[0.10] blur-[120px]" style={{ background: "radial-gradient(circle,#f5a524,transparent 70%)" }} />
  </div>
);

/* Stage 2 — six pillars connecting together */
const PillarsChain = () => (
  <div className="relative mt-8 rounded-3xl border border-white/10 bg-ccdp-charcoal/60 p-6 md:p-9">
    <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {FRAMEWORK_PILLARS.map((p) => {
        const Icon = Icons[p.icon] || Icons.Sparkles;
        return (
          <StaggerItem key={p.n}>
            <div className="group flex flex-col items-center gap-3 text-center">
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-black/40 transition-transform duration-300 group-hover:-translate-y-1"
                style={{ color: p.accent, boxShadow: `0 0 26px -8px ${p.accent}` }}>
                <span className="absolute inset-0 animate-spin-slow rounded-2xl opacity-40"
                  style={{ background: `conic-gradient(from 0deg, ${p.accent}, transparent 45%, transparent 55%, ${p.accent})` }} />
                <span className="absolute inset-[2px] rounded-2xl bg-ccdp-charcoal" />
                <Icon className="relative h-6 w-6" />
              </span>
              <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.06em] text-ccdp-cream/70">{p.title}</span>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
    <p className="mt-7 text-center text-sm leading-relaxed text-ccdp-cream/55">
      These are not six separate programs — they are six integrated dimensions of every learner's education.
    </p>
  </div>
);

/* Stage 3 — ANCR as the connected operating system */
const AncrNetwork = () => {
  const nodes = [[50, 8], [86, 26], [92, 62], [70, 90], [30, 90], [8, 62], [14, 26], [50, 30], [72, 55], [30, 55]];
  return (
    <div className="relative mx-auto mt-8 aspect-[16/11] w-full max-w-2xl">
      <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="ecoNet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2e7bff" /><stop offset="0.5" stopColor="#7a3ff2" /><stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {nodes.map(([x, y], i) => (
          <line key={i} x1="50" y1="35" x2={x} y2={y * 0.7} stroke="url(#ecoNet)" strokeWidth="0.4" className="flow-line" opacity="0.5" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x} cy={y * 0.7} r="1.3" fill={i % 2 ? "#06b6d4" : "#e0349e"} className="node-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="grid h-24 w-24 place-items-center rounded-2xl border border-white/12 bg-ccdp-black/80 p-4 shadow-2xl shadow-ccdp-purple/30 md:h-28 md:w-28">
          <img src={ANCR_MARK} alt="ANCR" className="h-full w-full object-contain" draggable="false" />
        </div>
      </div>
    </div>
  );
};

/* Stage 4 — modules orbiting ANCR */
const ModuleTile = ({ m }) => (
  <div className="group relative flex flex-col items-center">
    <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/12 bg-ccdp-charcoal/90 p-2.5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/30 md:h-[68px] md:w-[68px]"
      style={{ boxShadow: `0 0 0 1px transparent` }}>
      <img src={m.logo} alt={m.name} className="h-full w-full object-contain" draggable="false" />
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `0 0 30px -6px ${m.accent}, inset 0 0 0 1px ${m.accent}80` }} />
      {m.comingSoon && (
        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ccdp-gradient px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white">Soon</span>
      )}
    </div>
    <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-ccdp-cream/60">{m.name}</span>
    <div className="pointer-events-none absolute top-full z-30 mt-1 w-44 rounded-xl border border-white/12 bg-ccdp-black/95 p-3 text-center opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: m.accent }}>{m.tagline}</p>
      <p className="mt-1 text-[11px] leading-snug text-ccdp-cream/70">{m.short}</p>
    </div>
  </div>
);

const ModuleOrbit = () => (
  <div className="mt-8">
    {/* Orbit — md and up */}
    <div className="relative mx-auto hidden aspect-square w-full max-w-[720px] md:block">
      <div className="absolute inset-[6%] animate-orbit rounded-full border border-dashed border-white/10" />
      <div className="absolute inset-[26%] animate-orbit-rev rounded-full border border-white/[0.07]" />
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="grid h-28 w-28 place-items-center rounded-2xl border border-white/12 bg-ccdp-black/85 p-4 shadow-2xl shadow-ccdp-purple/30">
          <img src={ANCR_MARK} alt="ANCR" className="h-full w-full object-contain" draggable="false" />
        </div>
      </div>
      {ORBIT.map((m, i) => {
        const a = (i / ORBIT.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + 44 * Math.cos(a);
        const y = 50 + 44 * Math.sin(a);
        return (
          <div key={m.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <ModuleTile m={m} />
          </div>
        );
      })}
    </div>
    {/* Grid — mobile */}
    <div className="grid grid-cols-3 gap-x-3 gap-y-6 md:hidden">
      {ORBIT.map((m) => <div key={m.id} className="flex justify-center"><ModuleTile m={m} /></div>)}
    </div>
    <p className="mt-10 text-center text-sm leading-relaxed text-ccdp-cream/55">Every module connects back to ANCR — one operating system, one connected professional ecosystem.</p>
  </div>
);

const StageBlock = ({ stage, overline, headline, body, children, chips, image, reverse }) => {
  const Media = image && (
    <div className="relative overflow-hidden rounded-3xl border border-white/10">
      <img src={image} alt={headline} className="h-full max-h-[420px] w-full object-cover" draggable="false" />
      <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-25" style={{ background: `linear-gradient(130deg, ${stage.accent}, transparent 60%)` }} />
    </div>
  );
  const Text = (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white" style={{ background: stage.accent, boxShadow: `0 0 22px ${stage.accent}aa` }}>{stage.n}</span>
        <span className="overline" style={{ color: stage.accent }}>{overline}</span>
      </div>
      <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">{headline}</h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ccdp-cream/70">{body}</p>
      {chips && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ccdp-cream/70">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="relative pl-14 md:pl-24">
      {/* rail node */}
      <span className="absolute left-[18px] top-1.5 z-10 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full md:left-[42px]" style={{ background: stage.accent, boxShadow: `0 0 20px ${stage.accent}` }}>
        <span className="h-2 w-2 rounded-full bg-white/90" />
      </span>
      <Reveal>
        {image ? (
          <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
            {Text}{Media}
          </div>
        ) : Text}
        {children}
      </Reveal>
    </div>
  );
};

export default function Ecosystem() {
  const { openBriefing } = useInquiry();
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="The ANCR Ecosystem" description="The connected CCDP ecosystem — an education operating system uniting learning, creative production, collaboration, identity, and career development into one continuous creative journey." />
      <Navbar />

      {/* Hero */}
      <section data-testid="ecosystem-page-hero" className="grain relative overflow-hidden pt-[72px]">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: `url(${ASSETS.mesh})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ccdp-black/50 via-ccdp-black/75 to-ccdp-black" />
        <Ambient />
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 text-center md:px-10 md:py-28">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="overline text-ccdp-cream/70">The Creative Lifecycle</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="mx-auto mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.0] tracking-tight text-ccdp-white sm:text-6xl lg:text-[4.25rem]">
            One Connected <span className="text-gradient">Journey.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="mx-auto mt-6 font-display text-lg font-semibold uppercase tracking-[0.14em] text-ccdp-blue">
            Discover · Develop · Deploy · Thrive
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.28 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/70">
            Supporting creatives through every stage of learning, career development, and lifelong professional growth.
          </motion.p>

          {/* horizontal stage rail */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-ccdp-blue via-ccdp-purple to-ccdp-magenta opacity-50" />
              {STAGES.map((s) => (
                <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full" style={{ background: s.accent, boxShadow: `0 0 16px ${s.accent}` }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ccdp-cream/60 sm:text-xs">{s.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* Editorial band — Black & Brown creative team (parallax) */}
      <ParallaxBand
        testid="ecosystem-editorial-band"
        image="https://images.unsplash.com/photo-1653565684985-0b1a64cf7afc?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000"
        alt="Black and Brown creative team collaborating in a studio"
        tint="linear-gradient(115deg, rgba(46,123,255,0.30), transparent 45%, rgba(224,52,158,0.26))"
        overline="One Ecosystem"
        headline="Where creators, technology, and opportunity connect."
      />

      <section className="relative overflow-hidden section-rich py-16 md:py-24">
        <Ambient />
        <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
          <div className="relative">
            {/* spine */}
            <div className="absolute bottom-0 left-[18px] top-0 w-px md:left-[42px]">
              <div className="h-full w-full bg-gradient-to-b from-ccdp-blue via-ccdp-purple to-ccdp-magenta opacity-40" />
              <span className="flow-dot absolute left-1/2 h-16 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-white to-transparent opacity-80" />
            </div>

            <div className="space-y-20 md:space-y-28">
              <StageBlock stage={STAGES[0]} overline="Stage 1 · Discover" headline="Discover Your Calling." image={DISCOVER_IMG}
                chips={["Admissions", "Creative Discovery", "Assessment", "Orientation", "Purpose", "Potential"]}
                body="Creative careers begin with discovery. CCDP helps learners identify their talents, passions, purpose, and career direction before entering a structured learning journey." />

              <StageBlock stage={STAGES[1]} overline="Stage 2 · Develop" headline="Learn Through Experience."
                body={<>CCDP delivers higher education, certificates, industry-aligned curriculum, faculty mentorship, applied learning, studio experiences, research, and real-world creative practice. This is where students develop through the <span className="text-ccdp-white">Educational Framework</span>.</>}>
                <PillarsChain />
              </StageBlock>

              <StageBlock stage={STAGES[2]} overline="Stage 3 · Connect" headline="One Connected Learning Ecosystem."
                body="ANCR powers the digital experience across CCDP. Every learner receives a connected technology experience supporting collaboration, communication, identity, portfolios, projects, mentorship, and career readiness.">
                <AncrNetwork />
              </StageBlock>

              <StageBlock stage={STAGES[3]} overline="Stage 4 · Deploy" headline="From Learning to Career."
                body="As learners grow, ANCR expands into a complete professional ecosystem supporting creative careers — every module connected around one operating system.">
                <ModuleOrbit />
              </StageBlock>

              <StageBlock stage={STAGES[4]} overline="Stage 5 · Thrive" headline="Build a Lifetime of Creative Success." image={THRIVE_IMG} reverse
                chips={["Studios", "Companies", "Entrepreneurs", "Global Collaboration", "Creative Leadership"]}
                body="Graduation is not the end. CCDP and ANCR continue supporting learners throughout their careers — lifelong learning, entrepreneurship, employment, collaboration, leadership, funding, publishing, licensing, global partnerships, and professional growth." />
            </div>
          </div>
        </div>
      </section>

      {/* Final statement */}
      <section className="relative overflow-hidden border-t border-white/5 section-rich py-20 md:py-28">
        <Ambient />
        <div className="relative mx-auto max-w-[1100px] px-5 text-center md:px-10">
          <Reveal>
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ccdp-white sm:text-6xl">
              One Ecosystem.<br />One Journey.<br /><span className="text-gradient">One Future.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10 flex items-center justify-center gap-6">
              <img src={CCDP_MARK} alt="CCDP" className="h-9 w-auto object-contain md:h-11" draggable="false" />
              <span className="relative grid h-14 w-14 place-items-center rounded-full">
                <span className="absolute inset-0 rounded-full bg-ccdp-gradient opacity-70 blur-md" />
                <span className="absolute inset-[3px] rounded-full bg-ccdp-black" />
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-ccdp-gradient text-white"><InfinityIcon className="h-5 w-5" /></span>
              </span>
              <img src={ANCR_MARK} alt="ANCR" className="h-8 w-auto object-contain md:h-9" draggable="false" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ccdp-cream/70">
              From first discovery through lifelong professional success, CCDP and ANCR prepare creatives to discover, develop, deploy, and thrive.
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <button type="button" onClick={openBriefing} data-testid="ecosystem-cta-btn"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5">
              Schedule an Executive Briefing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
      <Footer />
    </div>
  );
}
