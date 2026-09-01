import * as Icons from "lucide-react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { UNIVERSITY, PARTNERSHIP_MODELS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

export const Partnerships = () => {
  const { openInquiry } = useInquiry();
  return (
    <section id="partnerships" data-testid="partnerships-section" className="section-rich py-24 text-ccdp-cream md:py-36">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="overline flex items-center gap-3 text-ccdp-cream/50">
                <span className="inline-block h-px w-8 bg-white/25" />
                {UNIVERSITY.overline}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
                CCDP complements and{" "}
                <span className="text-gradient">strengthens your institution.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-ccdp-cream/70">{UNIVERSITY.lead}</p>
          </Reveal>
        </div>

        {/* Retain / Provide */}
        <div className="mt-16 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <p className="overline text-ccdp-cream/45">Universities retain</p>
              <ul className="mt-6 space-y-3">
                {UNIVERSITY.retain.map((r) => (
                  <li key={r} data-testid={`retain-${r.split(" ")[0].toLowerCase()}`} className="flex items-center gap-3 text-sm font-medium text-ccdp-cream/85">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-ccdp-cream"><Check className="h-3.5 w-3.5" /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-8">
            <div className="h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/60 p-8 text-ccdp-cream">
              <p className="overline text-ccdp-cream/50">CCDP provides</p>
              <Stagger className="mt-6 flex flex-wrap justify-center gap-2.5">
                {UNIVERSITY.provide.map((p) => (
                  <StaggerItem key={p} className="w-full sm:w-[calc(50%-0.3125rem)]">
                    <div data-testid={`provide-${p.split(" ")[0].toLowerCase()}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-ccdp-cream/90">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ccdp-gradient text-white"><Plus className="h-3.5 w-3.5" /></span>
                      {p}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Reveal>
        </div>

        {/* Engagement models */}
        <Stagger className="mt-4 grid gap-4 md:grid-cols-2">
          {PARTNERSHIP_MODELS.map((m) => {
            const Icon = Icons[m.icon] || Icons.Building2;
            return (
              <StaggerItem key={m.title}>
                <article data-testid={`partnership-model-${m.title.split(" ")[0].toLowerCase()}`}
                  className="group flex h-full items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-ccdp-cream transition-colors duration-300 group-hover:bg-ccdp-gradient group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ccdp-white">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{m.desc}</p>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.2}>
          <button type="button" onClick={() => openInquiry("partnership")} data-testid="partnerships-cta-btn"
            className="group mt-14 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
            Explore University Partnerships
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};
