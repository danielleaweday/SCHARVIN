import * as Icons from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { IMPACT_PLACEHOLDERS } from "../lib/content";

export const ImpactMetrics = () => {
  return (
    <section id="impact" data-testid="impact-section" className="relative bg-ccdp-black py-24 text-ccdp-cream md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="overline flex items-center gap-3 text-ccdp-cream/50">
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
            Impact & Traction
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Built for measurable impact.{" "}
            <span className="text-gradient">Reporting as we grow.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/55">
            We publish only verified results. As pilots launch and partnerships
            form, this is where outcomes will appear.
          </p>
        </Reveal>

        <Stagger className="mt-14 flex flex-wrap justify-center gap-4">
          {IMPACT_PLACEHOLDERS.map((m) => {
            const Icon = Icons[m.icon] || Icons.BarChart3;
            return (
              <StaggerItem key={m.title} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
                <article data-testid={`impact-placeholder-${m.title.split(" ")[0].toLowerCase()}`}
                  className="gradient-ring relative h-full overflow-hidden rounded-2xl border border-dashed border-white/15 bg-ccdp-charcoal/40 p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-gradient">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/50">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ccdp-white">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{m.desc}</p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

        <p className="mt-8 text-xs text-ccdp-cream/30">
          We do not display metrics we have not yet achieved. All figures will be added once verified.
        </p>
      </div>
    </section>
  );
};
