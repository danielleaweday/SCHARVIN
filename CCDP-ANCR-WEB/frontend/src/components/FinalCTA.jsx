import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { CTAS, ASSETS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

export const FinalCTA = () => {
  const { openInquiry, openBriefing } = useInquiry();
  return (
    <section id="engage" data-testid="finalcta-section" className="relative bg-ccdp-black py-6">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10">
          <img src={ASSETS.mesh} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ccdp-black/70" />
          <div className="relative z-10 px-6 py-20 md:px-16 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <p className="overline text-ccdp-cream/60">Partner · Invest · Collaborate</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-6 font-display text-4xl font-medium leading-[1.03] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
                  Let's build the future of{" "}
                  <span className="text-gradient">creative education together.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mx-auto mt-6 max-w-xl text-lg text-ccdp-cream/70">
                  Choose how you'd like to engage with CCDP. Our team will follow
                  up within one business day.
                </p>
              </Reveal>
            </div>

            <Stagger className="mx-auto mt-14 grid max-w-4xl gap-3 md:grid-cols-2">
              {CTAS.map((c, i) => {
                const Icon = Icons[c.icon] || Icons.ArrowRight;
                const featured = i === 0;
                return (
                  <StaggerItem key={c.title} className={featured ? "md:col-span-2" : ""}>
                    <motion.button
                      type="button"
                      onClick={() => (c.intent === "briefing" ? openBriefing() : openInquiry(c.intent))}
                      data-testid={`cta-${i}`}
                      whileHover={{ y: -3 }}
                      className={`group flex h-full w-full items-center gap-4 rounded-2xl border p-6 text-left transition-colors duration-300 ${
                        featured
                          ? "border-transparent bg-ccdp-gradient text-white"
                          : "border-white/12 bg-ccdp-charcoal/60 text-ccdp-cream hover:bg-ccdp-charcoal"
                      }`}
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${featured ? "bg-white/20 text-white" : "bg-white/5 text-gradient"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-base font-semibold tracking-tight">{c.title}</span>
                        <span className={`mt-0.5 block text-sm ${featured ? "text-white/80" : "text-ccdp-cream/55"}`}>{c.desc}</span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
};
