import { useState } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { GLOBAL_ADOPTION } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const G = GLOBAL_ADOPTION;
const MAP = "/brand/global-map.jpg";

/* Curved connector path between two nodes (percentage coordinates) */
const arc = (a, b) => {
  const mx = (a.x + b.x) / 2;
  const my = Math.min(a.y, b.y) - 10;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
};

const GlobalMap = ({ active, setActive }) => (
  <div data-testid="global-map" className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ccdp-black">
    <img src={MAP} alt="A dark world map with luminous connection points at Toronto, New York, Amsterdam, and Lagos linked by glowing arcs, illustrating CCDP's global collaboration vision." draggable="false" className="h-full w-full object-cover opacity-70" />
    <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black/80 via-transparent to-ccdp-black/20" />

    {/* arcs */}
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ga-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2e7bff" />
          <stop offset="50%" stopColor="#e0349e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {[[0, 1], [1, 2], [2, 3], [0, 3]].map(([i, j], k) => (
        <path key={k} d={arc(G.cities[i], G.cities[j])} fill="none" stroke="url(#ga-arc)" strokeWidth="0.4" strokeLinecap="round" opacity="0.7"
          vectorEffect="non-scaling-stroke" />
      ))}
    </svg>

    {/* city nodes */}
    {G.cities.map((c, i) => {
      const isActive = active === i;
      return (
        <button key={c.name} type="button" onClick={() => setActive(i)} data-testid={`city-${c.name.replace(/\s/g, "").toLowerCase()}`}
          aria-label={`${c.name}: ${c.role}`} aria-pressed={isActive}
          className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ccdp-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ccdp-black"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}>
          <span className={`absolute inset-0 -m-2 rounded-full bg-ccdp-magenta ${isActive ? "opacity-70" : "opacity-40"} animate-ping`} style={{ animationDelay: `${i * 0.4}s` }} />
          <span className={`relative block rounded-full ring-2 ring-white/70 transition-all ${isActive ? "h-3.5 w-3.5 bg-ccdp-magenta" : "h-2.5 w-2.5 bg-white"}`} />
          <span className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm transition-colors ${isActive ? "text-ccdp-white" : "text-ccdp-cream/75"}`}>
            {c.name}
          </span>
        </button>
      );
    })}

    {/* illustrative role card */}
    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/12 bg-black/55 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-ccdp-gradient px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Illustrative Global Collaboration</span>
      </div>
      <p data-testid="city-role" className="mt-2 text-sm leading-snug text-ccdp-cream/90">
        <span className="font-semibold text-ccdp-white">{G.cities[active].name}:</span> {G.cities[active].role}
      </p>
      <p className="mt-1.5 text-[11px] italic text-ccdp-cream/50">An example of CCDP's connected model and global adoption vision.</p>
    </div>
  </div>
);

export const GlobalAdoption = () => {
  const [active, setActive] = useState(0);
  const { openBriefing } = useInquiry();
  return (
    <section id="global-adoption" data-testid="global-adoption-section" className="relative overflow-hidden bg-ccdp-black py-24 text-ccdp-cream md:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full opacity-[0.1] blur-[130px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="overline flex items-center gap-3 text-ccdp-cream/50">
                <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> {G.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ccdp-white sm:text-5xl">
                Creative education without <span className="text-gradient">creative borders.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 font-display text-lg font-semibold text-ccdp-cream/80 md:text-xl">{G.subhead}</p>
            </Reveal>
            {G.body.map((p, i) => (
              <Reveal key={i} delay={0.2 + i * 0.05}>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-ccdp-cream/65">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <GlobalMap active={active} setActive={setActive} />
          </Reveal>
        </div>

        {/* Features */}
        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {G.features.map((f) => {
            const Icon = Icons[f.icon] || Icons.Sparkles;
            return (
              <StaggerItem key={f.title}>
                <div data-testid={`global-feature-${f.title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ccdp-gradient text-white"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-ccdp-white">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ccdp-cream/65">{f.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Global CTA */}
        <Reveal delay={0.1}>
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-ccdp-charcoal/60 p-9 text-center md:p-14">
            <span className="pointer-events-none absolute inset-x-0 h-px bg-ccdp-gradient opacity-70" />
            <MapPin className="mx-auto h-7 w-7 text-ccdp-magenta" />
            <h3 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">{G.cta.headline}</h3>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/65">{G.cta.body}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={openBriefing} data-testid="global-cta-primary"
                className="group inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5">
                {G.cta.primary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button type="button" onClick={openBriefing} data-testid="global-cta-secondary"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-ccdp-white transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.08]">
                {G.cta.secondary}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
