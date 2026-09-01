import * as Icons from "lucide-react";
import { FileText, ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { INVESTMENT, ASSETS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

export const Investment = () => {
  const { openInquiry } = useInquiry();
  return (
    <section id="investment" data-testid="investment-section" className="grain relative overflow-hidden bg-ccdp-black py-24 text-ccdp-cream md:py-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ backgroundImage: `url(${ASSETS.mesh})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50">
              <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
              {INVESTMENT.overline}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              A scalable model for a{" "}
              <span className="text-gradient">new category of higher education.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg leading-relaxed text-ccdp-cream/65">{INVESTMENT.lead}</p>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INVESTMENT.points.map((p) => {
            const Icon = Icons[p.icon] || Icons.TrendingUp;
            return (
              <StaggerItem key={p.title}>
                <article data-testid={`investment-point-${p.title.split(" ")[0].toLowerCase()}`}
                  className="gradient-ring relative h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/50 p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-gradient">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-ccdp-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{p.desc}</p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-col items-start justify-between gap-8 rounded-[2rem] border border-white/10 bg-ccdp-charcoal/60 p-8 md:flex-row md:items-center md:p-12">
            <div>
              <p className="overline text-ccdp-cream/40">Ways to engage</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {INVESTMENT.ways.map((w) => (
                  <span key={w} className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-ccdp-cream/80">{w}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => openInquiry("deck")} data-testid="investment-deck-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-ccdp-cream transition-colors hover:bg-white/5">
                <FileText className="h-4 w-4" /> Request the Deck
              </button>
              <button type="button" onClick={() => openInquiry("invest")} data-testid="investment-cta-btn"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ccdp-gradient px-7 py-4 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
                Invest in the Future
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
