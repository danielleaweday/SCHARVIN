import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./Reveal";

// Full-width editorial image band with subtle, smooth scroll-linked parallax.
export const ParallaxBand = ({ image, alt, tint, overline, headline, testid }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section data-testid={testid} ref={ref} className="relative overflow-hidden">
      <div className="relative h-[42vh] min-h-[320px] w-full md:h-[50vh]">
        <motion.img
          style={{ y }}
          src={image}
          alt={alt}
          loading="lazy"
          className="absolute inset-x-0 top-1/2 h-[124%] w-full -translate-y-1/2 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black via-ccdp-black/60 to-ccdp-black/70" />
        <div className="absolute inset-0 opacity-70" style={{ background: tint, mixBlendMode: "overlay" }} />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-end px-5 pb-10 md:px-10 md:pb-14">
          <Reveal>
            <p className="overline text-ccdp-cream/70">{overline}</p>
            <p className="mt-3 max-w-2xl font-display text-2xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-3xl md:text-4xl">{headline}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
