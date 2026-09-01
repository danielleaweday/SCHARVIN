import * as Icons from "lucide-react";
import { Infinity as InfinityIcon, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import {
  SIGNATURE_EXPERIENCES,
  CONCENTRATIONS,
  INTELLIGENCE_SYSTEMS,
  SHARED_COLLAB,
  LIFECYCLE,
} from "../lib/content";

const Ambient = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full opacity-[0.13] blur-[120px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
    <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full opacity-[0.12] blur-[120px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
    <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full opacity-[0.09] blur-[120px]" style={{ background: "radial-gradient(circle,#f5a524,transparent 70%)" }} />
  </div>
);

const Chip = ({ children, accent }) => (
  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-ccdp-cream/70 transition-colors duration-200 hover:border-white/25 hover:text-ccdp-white"
    style={accent ? { borderColor: `${accent}33` } : undefined}>
    {children}
  </span>
);

const SectionHead = ({ kicker, title, accent = "#7a3ff2", desc, center }) => (
  <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    <Reveal><p className="overline" style={{ color: accent }}>{kicker}</p></Reveal>
    <Reveal delay={0.08}>
      <h3 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">{title}</h3>
    </Reveal>
    {desc && <Reveal delay={0.14}><p className={`mt-4 text-base leading-relaxed text-ccdp-cream/65 ${center ? "mx-auto" : ""} max-w-2xl`}>{desc}</p></Reveal>}
  </div>
);

const GlassPanel = ({ children, className = "", ...rest }) => (
  <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-ccdp-charcoal/70 ${className}`} {...rest}>{children}</div>
);

const IconBadge = ({ name, accent, size = "h-14 w-14" }) => {
  const Icon = Icons[name] || Icons.Sparkles;
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-2xl`}>
      <span className="absolute inset-0 animate-spin-slow rounded-2xl opacity-50" style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 45%, transparent 55%, ${accent})` }} />
      <span className="absolute inset-[2px] rounded-2xl bg-ccdp-charcoal" />
      <Icon className="relative h-6 w-6" style={{ color: accent }} />
    </span>
  );
};

export const LearningExperience = () => (
  <section id="learning-experience" data-testid="future-education-section" className="relative overflow-hidden bg-ccdp-black py-20 md:py-28">
    <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/30 to-transparent" />
    <Ambient />
    <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">

      {/* Hero — editorial split with diverse creator imagery */}
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <Reveal><p className="overline flex items-center gap-3 text-ccdp-cream/55"><span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> The New Creative Degree</p></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              You build a career <span className="text-gradient">from the first day.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ccdp-cream/65">
              CCDP is built around signature learning experiences — proprietary,
              end-to-end systems that develop identity, ownership, technology fluency, and real professional
              outcomes. Disciplines become supporting concentrations. The experience is the degree.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-ccdp-blue/15">
            <img src="https://images.unsplash.com/photo-1761957375236-b56417a3f034?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
              alt="A diverse community of creators building their careers together" draggable="false"
              className="aspect-[5/4] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black/75 via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(130deg,#2e7bff,transparent 60%)" }} />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
          </div>
        </Reveal>
      </div>

      {/* PART 3 — Signature Learning Experiences */}
      <div className="mt-16">
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNATURE_EXPERIENCES.map((s) => (
            <StaggerItem key={s.name}>
              <GlassPanel className="flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1.5"
                data-testid={`signature-${s.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}>
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }} />
                <div className="flex items-start gap-4">
                  <IconBadge name={s.icon} accent={s.accent} size="h-12 w-12" />
                  <h4 className="mt-1 font-display text-lg font-semibold leading-tight text-ccdp-white">{s.name}</h4>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ccdp-cream/60">{s.desc}</p>
              </GlassPanel>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Supporting concentrations — deliberately de-emphasized */}
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/40">Supporting concentrations</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONCENTRATIONS.map((c) => <Chip key={c}>{c}</Chip>)}
            </div>
          </div>
        </Reveal>
      </div>

      {/* PART 4 — ANCR Education Operating System: Eight Intelligence Systems (balanced 4x2 card system) */}
      <div className="mt-20">
        <SectionHead kicker="The ANCR Education Operating System" accent="#7a3ff2"
          title="Eight intelligence systems, working as one." center
          desc="ANCR embeds intelligence into every stage of the creative journey — from discovery and learning to collaboration, production, publishing, career development, and lifelong growth." />
        <Stagger className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INTELLIGENCE_SYSTEMS.map((s) => (
            <StaggerItem key={s.name}>
              <GlassPanel data-testid={`intelligence-${s.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                className="group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1.5">
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }} />
                <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 1px ${s.accent}55, 0 34px 90px -50px ${s.accent}` }} />
                <IconBadge name={s.icon} accent={s.accent} />
                <h4 className="mt-5 font-display text-lg font-semibold leading-tight text-ccdp-white">{s.name}</h4>
                <p className="mt-3 text-sm leading-relaxed text-ccdp-cream/60">{s.desc}</p>
              </GlassPanel>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.18}>
          <div className="mt-12 text-center">
            <Link to="/platform" data-testid="learning-platform-link"
              className="group inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ccdp-purple/20 transition-transform duration-300 hover:-translate-y-0.5">
              Explore the ANCR platform
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* PART 5 — Shared Global Collaboration (cinematic people band) */}
      <div className="mt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
          <img src="https://images.unsplash.com/photo-1758272133771-b149318883c5?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"
            alt="Creators collaborating across disciplines and borders" draggable="false"
            className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ccdp-black/88 via-ccdp-black/72 to-ccdp-black/92" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
          <div className="relative px-6 py-14 md:px-12 md:py-16">
            <SectionHead kicker="Shared Global Creation" accent="#f97316"
              title="Students learn, build, publish, and launch — together." center
              desc="Creative work at CCDP is shared by design — across institutions, disciplines, industries, and countries." />
            <Stagger className="mt-10 flex flex-wrap justify-center gap-3">
              {SHARED_COLLAB.map((c) => {
                const Icon = Icons[c.icon] || Icons.Users;
                return (
                  <StaggerItem key={c.name} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]">
                    <div data-testid={`shared-${c.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                      className="group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-ccdp-charcoal/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-ccdp-cream transition-colors duration-300 group-hover:text-gradient">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-sm font-semibold leading-tight text-ccdp-white">{c.name}</span>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>

      {/* PART 8 — Lifelong creator ecosystem */}
      <div className="mt-24 text-center">
        <Reveal>
          <h3 className="mx-auto max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-5xl">
            Education that doesn't end at <span className="text-gradient">graduation.</span>
          </h3>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {LIFECYCLE.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-ccdp-cream/80">{s}</span>
                {i < LIFECYCLE.length - 1 && <span className="h-1.5 w-1.5 rounded-full bg-ccdp-gradient" />}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-ccdp-charcoal/70 px-6 py-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ccdp-gradient text-white"><InfinityIcon className="h-4 w-4" /></span>
            <span className="font-display text-sm font-semibold tracking-wide text-ccdp-white">One ecosystem. One lifelong creative journey.</span>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);
