import * as Icons from "lucide-react";
import { Music, ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { INITIATIVES_FEATURED, INITIATIVES } from "../lib/content";

const F = INITIATIVES_FEATURED;

// Image slot — shows the provided image, or a premium branded placeholder until one is added.
const ImageSlot = ({ src, alt, icon = "Sparkles", accent = "#7a3ff2", className = "", waveform = false }) => {
  const Icon = Icons[icon] || Icons.Sparkles;
  if (src) {
    return <img src={src} alt={alt} draggable="false" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} aria-label={alt}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 20% 10%, ${accent}55, transparent 60%), radial-gradient(120% 120% at 90% 90%, #2e7bff44, transparent 55%), #0d0d12` }} />
      <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      {waveform && (
        <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-end justify-center gap-[3px] px-6 pb-8 opacity-70">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="w-[3px] rounded-full bg-white/70"
              style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 78}%`, opacity: 0.35 + (i % 5) * 0.12 }} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-[1px]">
          <Icon className="h-7 w-7 text-white/90" />
        </span>
      </div>
    </div>
  );
};

export const SignatureInitiatives = () => (
  <div className="mt-24" data-testid="initiatives-section">
    {/* Header */}
    <div className="mx-auto max-w-3xl text-center">
      <Reveal><p className="overline flex items-center justify-center gap-3 text-ccdp-cream/55"><span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Signature Industry Initiatives™</p></Reveal>
      <Reveal delay={0.08}>
        <h3 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl lg:text-5xl">
          Students don't just prepare for the creative industries.{" "}
          <span className="text-gradient">They help shape them.</span>
        </h3>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/65">
          Every year, CCDP learners collaborate across disciplines, technologies, institutions, and industries to
          develop original creative works, launch innovative projects, contribute research, build intellectual
          property, and participate in initiatives designed to create lasting impact beyond graduation.
        </p>
      </Reveal>
    </div>

    {/* Featured initiative — Creating a New Global Tradition of Gratitude (full-width cinematic movement) */}
    <Reveal delay={0.12}>
      <div data-testid="initiative-featured" className="relative mt-14 overflow-hidden rounded-[2rem] border border-white/10">
        <video autoPlay muted loop playsInline preload="auto" poster={F.image} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
          <source src={F.video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-ccdp-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black via-ccdp-black/85 to-ccdp-black/50" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />

        <div className="relative p-8 md:p-14 lg:p-16">
          {/* Opening statement — the movement */}
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/80">
              <span className="h-1.5 w-1.5 rounded-full bg-ccdp-gradient" /> Featured Initiative
            </span>
            <p className="mt-7 font-display text-2xl font-medium leading-snug tracking-tight text-ccdp-white sm:text-3xl md:text-4xl md:leading-[1.25]">
              {F.opening}
            </p>
          </div>

          {/* Title lockup */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ccdp-gradient text-white"><Music className="h-5 w-5" /></span>
              <h4 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ccdp-white md:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                <span className="text-gradient">{F.title}</span>
              </h4>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ccdp-cream/55">{F.poweredBy}</p>
              {F.body.map((p, i) => (
                <p key={i} className="mt-4 max-w-xl text-sm leading-relaxed text-ccdp-cream/80">{p}</p>
              ))}
            </div>

            {/* Initiative outcomes */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-[2px] md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/55">{F.outcomesLabel}</p>
              <ul className="mt-5 space-y-4">
                {F.outcomes.map((o) => {
                  const OIcon = Icons[o.icon] || Icons.Sparkles;
                  return (
                    <li key={o.text} className="flex items-start gap-3.5">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-ccdp-cream">
                        <OIcon className="h-4 w-4" />
                      </span>
                      <span className="text-sm leading-relaxed text-ccdp-cream/85">{o.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Reveal>

    {/* Additional signature initiatives */}
    <Stagger className="mt-4 flex flex-wrap justify-center gap-4">
      {INITIATIVES.map((it) => {
        const Icon = Icons[it.icon] || Icons.Sparkles;
        return (
          <StaggerItem key={it.name} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
            <article data-testid={`initiative-${it.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-ccdp-charcoal/70 transition-transform duration-300 hover:-translate-y-1.5">
              <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 1px ${it.accent}55, 0 30px 70px -40px ${it.accent}` }} />
              <div className="relative h-40 w-full overflow-hidden">
                <ImageSlot src={it.image} alt={it.name} icon={it.icon} accent={it.accent} />
                <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${it.accent}, ${it.accent}00)` }} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5" style={{ color: it.accent }}><Icon className="h-4 w-4" /></span>
                  <h4 className="font-display text-lg font-semibold leading-tight text-ccdp-white">{it.name}</h4>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ccdp-cream/60">{it.desc}</p>
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>

    {/* Closing statement */}
    <Reveal delay={0.1}>
      <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-ccdp-charcoal/70 p-9 text-center md:p-14">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
        <p className="mx-auto max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight text-ccdp-white sm:text-3xl md:leading-[1.35]">
          At CCDP, students don't simply earn degrees. They help create new traditions, develop intellectual
          property, build professional portfolios, launch meaningful work, and{" "}
          <span className="text-gradient">contribute to initiatives designed to influence the future of the creative industries.</span>
        </p>
      </div>
    </Reveal>
  </div>
);
