import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { PARTNER_CATEGORIES } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const CATEGORY_META = {
  "Higher Education": { icon: "GraduationCap", blurb: "Colleges & universities modernizing creative programs." },
  Foundations: { icon: "Landmark", blurb: "Mission-aligned funders advancing access & equity." },
  Technology: { icon: "Cpu", blurb: "Platforms powering creative tooling and AI." },
  Entertainment: { icon: "Clapperboard", blurb: "Studios, labels, and media collaborators." },
  Government: { icon: "Building2", blurb: "Agencies investing in workforce readiness." },
  Employers: { icon: "Briefcase", blurb: "Companies hiring job-ready creative talent." },
  "Workforce Development": { icon: "Users", blurb: "Programs connecting learners to careers." },
  Philanthropy: { icon: "HeartHandshake", blurb: "Donors backing the next generation of creatives." },
};

export const Partners = () => {
  const { openInquiry } = useInquiry();
  return (
    <section id="partners" data-testid="partners-section" className="section-rich py-24 text-ccdp-cream md:py-32">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="overline flex items-center gap-3 text-ccdp-cream/50">
                <span className="inline-block h-px w-8 bg-white/25" />
                Who we partner with
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 max-w-2xl font-display text-4xl font-medium leading-none tracking-tight text-ccdp-white sm:text-5xl">
                Built in partnership across{" "}
                <span className="text-gradient">the creative economy.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="max-w-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ccdp-cream/60">
                <span className="h-1.5 w-1.5 rounded-full bg-ccdp-gradient" /> Founding cohort forming
              </span>
              <p className="mt-4 text-base leading-relaxed text-ccdp-cream/60">
                We collaborate across eight partner categories. Named partners are
                announced here as each relationship is confirmed.
              </p>
            </div>
          </Reveal>
        </div>

        <Stagger className="mt-14 flex flex-wrap justify-center gap-4">
          {PARTNER_CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c] || { icon: "Building2", blurb: "" };
            const Icon = Icons[meta.icon] || Icons.Building2;
            return (
              <StaggerItem key={c} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)]">
                <div data-testid={`partner-category-${c.split(" ")[0].toLowerCase()}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-ccdp-cream transition-colors duration-300 group-hover:bg-ccdp-gradient group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-ccdp-white">{c}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ccdp-cream/55">{meta.blurb}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-ccdp-charcoal/60 p-8 text-ccdp-cream md:flex-row md:items-center md:p-10">
            <p className="max-w-xl font-display text-xl font-medium tracking-tight text-ccdp-white md:text-2xl">
              Become a founding partner, funder, or employer shaping the future
              of creative education.
            </p>
            <button type="button" onClick={() => openInquiry("partner")} data-testid="partners-cta-btn"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ccdp-gradient px-7 py-4 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
              Partner With Us
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
