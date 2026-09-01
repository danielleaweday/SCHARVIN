import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { MENTORSHIP } from "../lib/content";
import { SignatureInitiatives } from "./SignatureInitiatives";
import { useInquiry } from "../context/InquiryProvider";

const M = MENTORSHIP;

const Ambient = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-40 top-4 h-[34rem] w-[34rem] rounded-full opacity-[0.14] blur-[120px]" style={{ background: "radial-gradient(circle,#e0349e,transparent 70%)" }} />
    <div className="absolute -left-32 top-1/2 h-[30rem] w-[30rem] rounded-full opacity-[0.12] blur-[120px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
  </div>
);

const IconBadge = ({ name, accent, size = "h-12 w-12" }) => {
  const Icon = Icons[name] || Icons.Sparkles;
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center rounded-2xl`}>
      <span className="absolute inset-0 animate-spin-slow rounded-2xl opacity-50" style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 45%, transparent 55%, ${accent})` }} />
      <span className="absolute inset-[2px] rounded-2xl bg-ccdp-charcoal" />
      <Icon className="relative h-5 w-5" style={{ color: accent }} />
    </span>
  );
};

const SectionHead = ({ kicker, title, accent = "#e0349e", desc, center }) => (
  <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    <Reveal><p className="overline" style={{ color: accent }}>{kicker}</p></Reveal>
    <Reveal delay={0.08}>
      <h3 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">{title}</h3>
    </Reveal>
    {desc && <Reveal delay={0.14}><p className={`mt-4 text-base leading-relaxed text-ccdp-cream/65 ${center ? "mx-auto" : ""} max-w-2xl`}>{desc}</p></Reveal>}
  </div>
);

export const MentorshipStudio = () => {
  const { openBriefing } = useInquiry();
  return (
    <section id="mentorship" data-testid="mentorship-section" className="relative overflow-hidden bg-ccdp-black py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/30 to-transparent" />
      <Ambient />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">

        {/* Hero */}
        <div className="max-w-4xl">
          <Reveal><p className="overline flex items-center gap-3 text-ccdp-cream/55"><span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> {M.overline}</p></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              You build alongside the industry, <span className="text-gradient">from day one.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ccdp-cream/65">{M.lead}</p>
          </Reveal>
        </div>

        {/* Humanity band — real creative work, not interface */}
        <Reveal delay={0.1}>
          <div data-testid="mentorship-humanity-band" className="mt-16 grid gap-5 sm:grid-cols-3 md:gap-6">
            {[
              { src: "https://images.unsplash.com/photo-1591872959762-ffc2038e127d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", label: "In the Studio", sub: "Original work, made by hand" },
              { src: "https://images.unsplash.com/photo-1731461298455-088aae689fca?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", label: "On Stage", sub: "Work that reaches real audiences" },
              { src: "https://images.unsplash.com/photo-1551203145-c4506b81d959?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", label: "On Set", sub: "Creators directing their own stories" },
            ].map((img, i) => (
              <div key={img.label} className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 transition-transform duration-500 hover:-translate-y-1 ${i === 1 ? "sm:-translate-y-6 lg:-translate-y-10" : ""}`}>
                <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-ccdp-gradient opacity-70" />
                <img src={img.src} alt={img.label} draggable="false" className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:aspect-[3/4]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black via-ccdp-black/25 to-transparent" />
                <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 40px 120px -50px rgba(122,63,242,0.8)" }} />
                <div className="absolute inset-x-6 bottom-6">
                  <p className="font-display text-lg font-semibold tracking-tight text-ccdp-white md:text-xl">{img.label}</p>
                  <p className="mt-1 text-sm text-ccdp-cream/70">{img.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Learn from — mentor types */}
        <div className="mt-16 text-center">
          <Reveal><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/45">Students learn directly from</p></Reveal>
          <Reveal delay={0.08}>
            <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-2.5">
              {M.mentors.map((m) => (
                <span key={m} data-testid={`mentor-${m.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-ccdp-cream/80 transition-colors duration-200 hover:border-ccdp-magenta/50 hover:text-ccdp-white">
                  {m}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <p data-testid="mentorship-verbs" className="mx-auto mt-8 max-w-3xl font-display text-xl font-medium leading-snug tracking-tight text-ccdp-white sm:text-2xl md:leading-[1.35]">
              They{" "}
              <span className="text-gradient">mentor, produce, develop, release, and launch</span>{" "}
              original work alongside you.
            </p>
          </Reveal>
        </div>
        <div className="mt-24">
          <SectionHead kicker="The Studio Learning Model" accent="#a855f7"
            title="Students build real work in a professional studio." center
            desc="A professional, collaborative studio model where creators build alongside working professionals." />
          <Stagger className="mt-10 flex flex-wrap justify-center gap-3">
            {M.studioModel.map((s) => {
              const Icon = Icons[s.icon] || Icons.Sparkles;
              return (
                <StaggerItem key={s.name} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]">
                  <div data-testid={`studio-${s.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                    className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                    <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }} />
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5" style={{ color: s.accent }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-sm font-semibold leading-tight text-ccdp-white">{s.name}</span>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        <SignatureInitiatives />

        {/* Professional Creative Output */}
        <div className="mt-24">
          <SectionHead kicker="Professional Creative Output" accent="#f59e0b"
            title="Graduate with a career-ready body of work that speaks for itself." />
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            {/* The ~30 works highlight */}
            <Reveal className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-ccdp-charcoal/70 p-8">
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg,#f59e0b,transparent)" }} />
                <div className="flex items-end gap-3">
                  <span className="font-display text-6xl font-extrabold leading-none text-gradient">{M.outcome.stat}</span>
                  <span className="mb-1 max-w-[10rem] text-sm font-semibold leading-tight text-ccdp-cream/80">{M.outcome.statLabel}</span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-ccdp-cream/65">{M.outcome.body}</p>
                <div className="mt-6 border-t border-white/8 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ccdp-cream/40">By discipline, this may include</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {M.outcome.examples.map((e) => (
                      <span key={e} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-ccdp-cream/70">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            {/* Output checklist */}
            <Reveal delay={0.12} className="lg:col-span-7">
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/45">Every creator develops, refines, releases &amp; owns</p>
                <Stagger className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {M.output.map((o) => (
                    <StaggerItem key={o}>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ccdp-charcoal/50 px-4 py-3 text-sm font-medium text-ccdp-cream/85">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ccdp-gradient text-white"><Icons.Check className="h-3.5 w-3.5" /></span>
                        {o}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Every student is surrounded by a team */}
        <div className="mt-24">
          <SectionHead kicker="An Integrated Development Team" accent="#10b981"
            title="Every student is surrounded by a team. No one builds alone." center />
          <Stagger className="mt-10 flex flex-wrap justify-center gap-3">
            {M.team.map((t) => (
              <StaggerItem key={t.label} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)]">
                <div data-testid={`team-${t.label.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-ccdp-charcoal/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <IconBadge name={t.icon} accent="#10b981" />
                  <span className="font-display text-sm font-semibold leading-tight text-ccdp-white">{t.label}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Positive positioning — connected from learning to livelihood */}
        <div className="mt-24">
          <Reveal>
            <div data-testid="positioning-section" className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ccdp-charcoal/70 p-9 text-center md:p-14">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
              <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full opacity-[0.14] blur-[110px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
              <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full opacity-[0.12] blur-[110px]" style={{ background: "radial-gradient(circle,#f59e0b,transparent 70%)" }} />

              <p className="overline relative text-gradient">{M.positioning.eyebrow}</p>
              <h3 className="relative mx-auto mt-5 max-w-3xl font-display text-3xl font-medium leading-[1.15] tracking-tight text-ccdp-white sm:text-4xl md:text-[2.75rem]">
                {M.positioning.headline}
              </h3>
              <p className="relative mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ccdp-cream/70 md:text-lg">
                {M.positioning.body}
              </p>
              <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ccdp-cream/60 md:text-base">
                {M.positioning.supporting}
              </p>
              <p className="relative mx-auto mt-8 max-w-2xl font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                <span className="text-gradient">{M.positioning.emphasis}</span>
              </p>
              <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#learning-experience" data-testid="positioning-primary-btn"
                  className="group inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5">
                  Explore the CCDP Solution
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <button type="button" onClick={openBriefing} data-testid="positioning-secondary-btn"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-ccdp-white transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.08]">
                  Schedule an Executive Briefing
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
