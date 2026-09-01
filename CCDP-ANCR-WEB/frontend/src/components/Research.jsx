import * as Icons from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { RESEARCH } from "../lib/content";

export const Research = () => {
  return (
    <section id="research" data-testid="research-section" className="section-rich-alt py-24 text-ccdp-cream md:py-36">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50">
              <span className="inline-block h-px w-8 bg-white/25" />
              {RESEARCH.overline}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              Advancing the science of{" "}
              <span className="text-gradient">creative learning.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg leading-relaxed text-ccdp-cream/70">{RESEARCH.lead}</p>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2">
          {RESEARCH.areas.map((a) => {
            const Icon = Icons[a.icon] || Icons.Sparkles;
            return (
              <StaggerItem key={a.title}>
                <article data-testid={`research-area-${a.title.split(" ")[0].toLowerCase()}`}
                  className="group flex h-full items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-ccdp-cream transition-colors duration-300 group-hover:bg-ccdp-gradient group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ccdp-white">{a.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{a.desc}</p>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
};
