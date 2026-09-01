import * as Icons from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { CHALLENGE } from "../lib/content";

/* Architectural threshold visual — continuity with the Creative Threshold hero (code-built). */
const FutureThreshold = () => {
  const cx = 260, top = 40, floor = 380, halfW = 178;
  const arches = [
    { s: 1.0, c: "#2e7bff" },
    { s: 0.8, c: "#7a3ff2" },
    { s: 0.62, c: "#e0349e" },
    { s: 0.46, c: "#f59e0b" },
    { s: 0.32, c: "#eab308" },
  ];
  const archPath = (sc) => {
    const w = halfW * sc, h = (floor - top) * sc, t = floor - h;
    return `M ${cx - w} ${floor} L ${cx - w} ${t + w} Q ${cx - w} ${t} ${cx} ${t} Q ${cx + w} ${t} ${cx + w} ${t + w} L ${cx + w} ${floor}`;
  };
  return (
    <div data-testid="challenge-threshold" className="relative h-full min-h-[340px] overflow-hidden rounded-[2rem] border border-white/10 bg-ccdp-black">
      <div className="absolute inset-0" style={{ background: "radial-gradient(110% 90% at 50% 28%, #191426 0%, #0b0a12 55%, #050506 100%)" }} />
      <div className="absolute left-1/2 top-[28%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-[38px]"
        style={{ background: "radial-gradient(circle, rgba(255,241,255,0.7), rgba(201,155,255,0.32) 45%, transparent 72%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="ch-open" cx="50%" cy="28%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#f0d6ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2e7bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={`${archPath(0.32)} Z`} fill="url(#ch-open)" />
        {arches.map((a, i) => (
          <path key={i} d={archPath(a.s)} fill="none" stroke={a.c} strokeOpacity={0.5 + i * 0.07}
            strokeWidth={2.2 - i * 0.22} strokeLinecap="round" className="arc-draw" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        <line x1="30" y1={floor} x2="490" y2={floor} stroke="#ffffff" strokeOpacity="0.1" />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top,#050506,transparent)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
      {/* "The future." integrated into the composition */}
      <div className="absolute inset-x-7 bottom-7">
        <div className="font-display text-4xl font-extrabold tracking-tight text-gradient md:text-5xl">{CHALLENGE.stat.value}</div>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ccdp-cream/75">{CHALLENGE.stat.label}</p>
      </div>
    </div>
  );
};

export const Challenge = () => {
  return (
    <section id="challenge" data-testid="challenge-section" className="relative overflow-hidden bg-ccdp-black py-16 text-ccdp-cream md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/30 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[30rem] w-[30rem] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full opacity-[0.12] blur-[130px]" style={{ background: "radial-gradient(circle,#e0349e,transparent 70%)" }} />

      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        {/* Wide transitional composition — statement + threshold visual */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-14">
          <div>
            <Reveal>
              <p className="overline flex items-center gap-3 text-ccdp-cream/50">
                <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
                {CHALLENGE.overline}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                {CHALLENGE.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-ccdp-cream/65">{CHALLENGE.lead}</p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <FutureThreshold />
          </Reveal>
        </div>

        {/* Supporting cards — full width beneath */}
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHALLENGE.items.map((it) => {
            const Icon = Icons[it.icon] || Icons.CircleAlert;
            return (
              <StaggerItem key={it.title}>
                <article data-testid={`challenge-card-${it.title.split(" ")[0].toLowerCase()}`}
                  className="gradient-ring group relative h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-7 transition-colors duration-300 hover:bg-ccdp-charcoal">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-ccdp-cream transition-colors duration-300 group-hover:text-gradient">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ccdp-white">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{it.desc}</p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
};
