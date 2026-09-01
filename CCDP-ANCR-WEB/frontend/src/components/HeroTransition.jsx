import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PILLARS = [
  { label: "Create", from: "#2e7bff", to: "#7a3ff2" },
  { label: "Collaborate", from: "#7a3ff2", to: "#e0349e" },
  { label: "Develop", from: "#e0349e", to: "#f59e0b" },
  { label: "Propel", from: "#f59e0b", to: "#eab308" },
];

// Slim transition band that bridges the hero into the section below it.
export const HeroTransition = () => (
  <section data-testid="hero-transition-band" className="relative z-10 -mt-px border-y border-white/[0.06] bg-ccdp-black">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ccdp-purple/50 to-transparent" />
    <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 py-8 text-center md:flex-row md:justify-center md:gap-8 md:py-9 md:px-10">
      <span className="overline text-ccdp-cream/45 md:whitespace-nowrap">From first idea to professional momentum</span>
      <span className="hidden h-5 w-px bg-white/10 md:block" aria-hidden="true" />
      <div data-testid="hero-pillars" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        {PILLARS.map((p, i) => (
          <div key={p.label} className="flex items-center gap-3">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="font-display text-sm font-bold uppercase tracking-[0.14em] sm:text-base"
              style={{ background: `linear-gradient(90deg, ${p.from}, ${p.to})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              {p.label}
            </motion.span>
            {i < PILLARS.length - 1 && <ArrowRight className="h-4 w-4 text-ccdp-cream/30" />}
          </div>
        ))}
      </div>
    </div>
    <div className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-px -translate-x-1/2 translate-y-full bg-gradient-to-b from-white/12 to-transparent" aria-hidden="true" />
  </section>
);
