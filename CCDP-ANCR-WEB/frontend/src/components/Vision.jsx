import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { VISION } from "../lib/content";

/* Creative Threshold pathway — nested archways receding to a bright horizon (code-built, no imagery). */
const ThresholdPathway = () => {
  const cx = 300, top = 70, floor = 560, halfW = 205;
  const arches = [
    { s: 1.0, c: "#2e7bff" },
    { s: 0.82, c: "#5b6cff" },
    { s: 0.66, c: "#7a3ff2" },
    { s: 0.52, c: "#e0349e" },
    { s: 0.4, c: "#f59e0b" },
    { s: 0.29, c: "#eab308" },
  ];
  const archPath = (sc) => {
    const w = halfW * sc, h = (floor - top) * sc, t = floor - h;
    return `M ${cx - w} ${floor} L ${cx - w} ${t + w} Q ${cx - w} ${t} ${cx} ${t} Q ${cx + w} ${t} ${cx + w} ${t + w} L ${cx + w} ${floor}`;
  };
  return (
    <div data-testid="vision-threshold" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-ccdp-black shadow-2xl shadow-ccdp-purple/20 md:aspect-[5/6]">
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 34%, #1a1526 0%, #0b0a12 52%, #050506 100%)" }} />
      {/* breathing core glow at the vanishing point */}
      <div className="absolute left-1/2 top-[33%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-[42px]"
        style={{ background: "radial-gradient(circle, rgba(255,241,255,0.75), rgba(201,155,255,0.35) 45%, transparent 72%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="vp-open" cx="50%" cy="36%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="30%" stopColor="#f0d6ff" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#7a3ff2" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2e7bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* light corridor spilling from the vanishing point to the foreground */}
        <path d={`M ${cx - halfW} ${floor} L ${cx - 10} ${top + 26} L ${cx + 10} ${top + 26} L ${cx + halfW} ${floor} Z`} fill="url(#vp-open)" opacity="0.14" />
        <path d={`${archPath(0.29)} Z`} fill="url(#vp-open)" />
        {arches.map((a, i) => (
          <path key={i} d={archPath(a.s)} fill="none" stroke={a.c} strokeOpacity={0.55 + i * 0.06}
            strokeWidth={2.4 - i * 0.2} strokeLinecap="round" className="arc-draw" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        {/* reflective floor line */}
        <line x1="40" y1={floor} x2="560" y2={floor} stroke="#ffffff" strokeOpacity="0.12" />
        <ellipse cx={cx} cy={floor + 14} rx={halfW * 0.9} ry="20" fill="url(#vp-open)" opacity="0.3" />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, #050506, transparent)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
      {/* glass caption */}
      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/12 bg-black/40 px-5 py-3.5 backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ccdp-cream/60">One connected creative future</p>
        <p className="mt-0.5 font-display text-sm font-semibold text-ccdp-white">From first idea through lifelong career.</p>
      </div>
    </div>
  );
};

export const Vision = () => (
  <section id="vision" data-testid="vision-section" className="relative overflow-hidden bg-ccdp-black py-20 md:py-28">
    <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-0 top-1/4 h-[34rem] w-[34rem] rounded-full opacity-[0.12] blur-[140px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
      <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full opacity-[0.12] blur-[140px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
    </div>

    <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
      {/* Left — statement */}
      <div>
        <Reveal>
          <p className="overline inline-flex items-center gap-3 text-ccdp-cream/55">
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> {VISION.overline}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
            This is where creative education is <span className="text-gradient">going.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ccdp-cream/70 md:leading-[1.7]">{VISION.statement}</p>
        </Reveal>
        <Reveal delay={0.28}>
          <div className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/10 bg-ccdp-charcoal/70 px-5 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ccdp-gradient text-white"><ArrowRight className="h-4 w-4" /></span>
            <span className="font-display text-sm font-semibold tracking-wide text-ccdp-white">Build the work. Own the future.</span>
          </div>
        </Reveal>
      </div>

      {/* Right — Creative Threshold pathway (code-built, no imagery) */}
      <Reveal delay={0.15}>
        <ThresholdPathway />
      </Reveal>
    </div>
  </section>
);
