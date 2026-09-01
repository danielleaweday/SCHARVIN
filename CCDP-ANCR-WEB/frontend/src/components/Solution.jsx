import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { SOLUTION } from "../lib/content";

const EASE = [0.22, 1, 0.36, 1];

// Radial positions (percent) around a center at 50/50 — start at top, clockwise.
const RX = 42;
const RY = 43;
const NODES = SOLUTION.nodes.map((n, i) => {
  const a = ((-90 + i * 45) * Math.PI) / 180;
  return { ...n, x: 50 + RX * Math.cos(a), y: 50 + RY * Math.sin(a) };
});

const Ambient = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[130px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
    <div className="absolute -left-24 top-10 h-[24rem] w-[24rem] rounded-full opacity-[0.10] blur-[120px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
    <div className="absolute -right-24 bottom-10 h-[24rem] w-[24rem] rounded-full opacity-[0.10] blur-[120px]" style={{ background: "radial-gradient(circle,#e0349e,transparent 70%)" }} />
  </div>
);

const Chip = ({ n, i, floating }) => {
  const Icon = Icons[n.icon] || Icons.Sparkles;
  return (
    <motion.div
      data-testid={`ecosystem-node-${n.label.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: EASE }}
      whileHover={{ y: -3 }}
      className={`${floating ? "absolute -translate-x-1/2 -translate-y-1/2" : ""} z-20 flex w-max max-w-[190px] items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] py-2.5 pl-2.5 pr-4 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]`}
      style={floating ? { left: `${n.x}%`, top: `${n.y}%` } : undefined}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ccdp-gradient text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-display text-[13px] font-semibold leading-tight tracking-tight text-ccdp-white">{n.label}</span>
    </motion.div>
  );
};

const CoreNode = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: EASE }}
    className="relative z-30 grid h-36 w-36 place-items-center md:h-48 md:w-48"
    data-testid="ecosystem-core"
  >
    <span className="absolute inset-0 animate-spin-slow rounded-full opacity-90" style={{ background: "conic-gradient(from 0deg,#2e7bff,#7a3ff2,#e0349e,#f5a524,#2e7bff)" }} />
    <span className="absolute inset-[3px] rounded-full bg-ccdp-black" />
    <span className="absolute inset-0 rounded-full bg-ccdp-gradient opacity-40 blur-2xl" />
    <span className="relative font-display text-3xl font-extrabold tracking-tight text-gradient md:text-4xl">CCDP</span>
  </motion.div>
);

export const Solution = () => {
  return (
    <section id="solution" data-testid="solution-section" className="relative overflow-hidden bg-ccdp-black py-20 text-ccdp-cream md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/30 to-transparent" />
      <Ambient />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="overline flex items-center justify-center gap-3 text-ccdp-cream/55">
              <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
              {SOLUTION.overline}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              CCDP brings together what creative education has{" "}
              <span className="text-gradient">never connected before.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ccdp-cream/65">{SOLUTION.lead}</p>
          </Reveal>
        </div>

        {/* Network visualization — desktop constellation (enlarged + strengthened lines + spectrum glow) */}
        <div className="relative mx-auto mt-16 hidden h-[760px] w-full max-w-6xl md:block">
          {/* restrained spectrum radial glow behind the core */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(122,63,242,0.6), rgba(46,123,255,0.25) 45%, rgba(224,52,158,0.16) 68%, transparent 80%)" }} />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2e7bff" stopOpacity="0.3" />
              </linearGradient>
              <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.9" />
              </filter>
            </defs>
            {NODES.map((n, i) => (
              <g key={i}>
                <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="url(#lineGrad)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" filter="url(#lineGlow)" opacity="0.5" />
                <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="url(#lineGrad)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" className="flow-line" />
              </g>
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CoreNode />
          </div>

          {NODES.map((n, i) => (
            <Chip key={n.label} n={n} i={i} floating />
          ))}
        </div>

        {/* Network visualization — mobile fallback (core + wrapped chips) */}
        <div className="mt-14 flex flex-col items-center gap-8 md:hidden">
          <CoreNode />
          <div className="flex flex-wrap justify-center gap-3">
            {NODES.map((n, i) => (
              <Chip key={n.label} n={n} i={i} />
            ))}
          </div>
        </div>

        {/* Integration statement */}
        <Reveal delay={0.15}>
          <p className="mx-auto mt-16 max-w-3xl text-center font-display text-xl font-medium leading-relaxed tracking-tight text-ccdp-white/90 sm:text-2xl md:leading-[1.4]">
            {SOLUTION.statement}
          </p>
        </Reveal>
      </div>
    </section>
  );
};
