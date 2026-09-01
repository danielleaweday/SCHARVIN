import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { EcosystemExperience } from "./ecosystem/EcosystemExperience";
import { ASSETS } from "../lib/content";

export const Ecosystem = () => {
  return (
    <section id="ecosystem" data-testid="ecosystem-section" className="grain relative overflow-hidden bg-ccdp-black py-20 text-ccdp-cream md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/30 to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40"
        style={{
          backgroundImage: `url(${ASSETS.mesh})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(#000, transparent)",
          WebkitMaskImage: "linear-gradient(#000, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <Reveal>
          <p className="overline flex items-center gap-3 text-ccdp-cream/50">
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
            The CCDP Ecosystem
          </p>
        </Reveal>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal delay={0.1}>
            <h2 className="max-w-2xl font-display text-4xl font-medium leading-[1.0] tracking-tight sm:text-5xl lg:text-6xl">
              One operating system.{" "}
              <span className="text-gradient">A connected suite of platforms.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-base leading-relaxed text-ccdp-cream/60">
              ANCR unifies every CCDP platform into a single identity and one
              continuous record — the technology backbone beneath the entire
              creative journey.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-14">
            <EcosystemExperience />
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex justify-center">
            <Link
              to="/platform"
              data-testid="ecosystem-explore-btn"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-ccdp-charcoal/70 px-7 py-3.5 text-sm font-semibold text-ccdp-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30"
            >
              Explore the full Technology Ecosystem
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
