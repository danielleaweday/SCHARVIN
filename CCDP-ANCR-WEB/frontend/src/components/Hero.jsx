import { useEffect } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, FileText, ChevronDown } from "lucide-react";
import { useInquiry } from "../context/InquiryProvider";

const EASE = [0.22, 1, 0.36, 1];

/* THE CREATIVE THRESHOLD — deeper, cinematic; continuous luminous currents (no map/dash effect). */
const ThresholdBackdrop = () => {
  const reduce = useReducedMotion();
  const cx = 1040, top = 96, floor = 700, halfW = 210; // larger, centerpiece doorway
  const arches = [
    { s: 1.0, color: "#2e7bff", op: 0.5 },
    { s: 0.84, color: "#5b6cff", op: 0.55 },
    { s: 0.69, color: "#7a3ff2", op: 0.6 },
    { s: 0.55, color: "#e0349e", op: 0.66 },
    { s: 0.42, color: "#f59e0b", op: 0.72 },
    { s: 0.3, color: "#eab308", op: 0.8 },
  ];
  const archPath = (s) => {
    const w = halfW * s, h = (floor - top) * s, t = floor - h;
    return `M ${cx - w} ${floor} L ${cx - w} ${t + w} Q ${cx - w} ${t} ${cx} ${t} Q ${cx + w} ${t} ${cx + w} ${t + w} L ${cx + w} ${floor}`;
  };

  // continuous spectrum currents flowing into the threshold base (no dashes) + traveling highlight
  const currents = [
    { id: 0, d: `M -60 400 q 70 -46 140 0 t 140 0 t 140 0 t 140 0 T ${cx} 560`, g: ["#2e7bff", "#7a3ff2"], hl: "#a9c7ff", w: 2.6, wob: -7, dur: 7 },
    { id: 1, d: `M -60 500 C 200 470 300 560 460 520 S 720 470 ${cx} 600`, g: ["#7a3ff2", "#e0349e"], hl: "#d8b3ff", w: 2.4, wob: 5, dur: 9 },
    { id: 2, d: `M -60 580 L 360 575 L 620 585 L ${cx} 632`, g: ["#e0349e", "#f59e0b"], hl: "#ffb0d8", w: 2.2, wob: 3, dur: 11 },
    { id: 3, d: `M -60 660 C 220 690 520 690 760 640 S 980 640 ${cx} 656`, g: ["#f59e0b", "#eab308"], hl: "#ffe08a", w: 2, wob: -4, dur: 13 },
  ];

  // subtle cursor parallax (desktop) for depth between the nested arches
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 40, damping: 22 });
  const py = useSpring(rawY, { stiffness: 40, damping: 22 });
  const glowX = useTransform(px, (v) => v * 0.5);
  const glowY = useTransform(py, (v) => v * 0.5);
  const innerX = useTransform(px, (v) => v * 2.4);
  const innerY = useTransform(py, (v) => v * 2.4);
  useEffect(() => {
    if (reduce) return;
    const onMove = (e) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 20);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 14);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, rawX, rawY]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ccdp-black" aria-hidden="true">
      {/* architectural depth + right-weighted ambient */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 105% at 70% 36%, #1a1526 0%, #0c0b12 46%, #050506 100%)" }} />

      {/* atmospheric haze + breathing core glow behind the threshold */}
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ left: "72%", top: "44%", height: "56vh", width: "56vh", x: glowX, y: glowY, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(224,52,158,0.55), rgba(122,63,242,0.30) 40%, rgba(46,123,255,0.12) 62%, transparent 76%)" }}
        {...(reduce ? {} : { animate: { scale: [1, 1.07, 1], opacity: [0.78, 1, 0.78] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })}
      />
      <motion.div className="absolute left-[72%] top-[44%] h-[24vh] w-[24vh] rounded-full blur-[26px]"
        style={{ x: glowX, y: glowY, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(255,241,255,0.6), rgba(201,155,255,0.28) 45%, transparent 72%)" }}
        {...(reduce ? {} : { animate: { opacity: [0.6, 0.95, 0.6] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } })}
      />

      {/* reflective black floor + spectrum reflection */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "26%", background: "linear-gradient(to top, #05060a 8%, rgba(10,10,16,0.6) 45%, transparent 100%)" }} />
      <motion.div className="absolute left-[72%] top-[78%] h-[20vh] w-[52vh] -translate-x-1/2 rounded-[100%] blur-[42px]"
        style={{ x: glowX, background: "radial-gradient(60% 100% at 50% 0%, rgba(122,63,242,0.5), rgba(46,123,255,0.16) 46%, transparent 74%)" }}
        {...(reduce ? {} : { animate: { opacity: [0.5, 0.75, 0.5] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })}
      />

      {/* drifting light motes — creative energy flowing toward the threshold */}
      {!reduce && [0, 1, 2].map((i) => (
        <motion.div key={i}
          className="absolute rounded-full blur-[10px]"
          style={{ top: `${46 + i * 9}%`, height: 14, width: 14, background: ["#4f8bff", "#e0349e", "#f59e0b"][i] }}
          animate={{ left: ["6%", "66%"], opacity: [0, 0.7, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeIn", delay: i * 2.2 }}
        />
      ))}

      <motion.svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ x: px, y: py }}>
        <defs>
          <radialGradient id="thr-open" cx="50%" cy="44%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="22%" stopColor="#f4d9ff" stopOpacity="0.82" />
            <stop offset="52%" stopColor="#a86bff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2e7bff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="thr-floorrefl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c99bff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2e7bff" stopOpacity="0" />
          </linearGradient>
          {currents.map((c) => (
            <linearGradient key={c.id} id={`cur-${c.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c.g[0]} stopOpacity="0" />
              <stop offset="30%" stopColor={c.g[0]} stopOpacity="0.9" />
              <stop offset="100%" stopColor={c.g[1]} stopOpacity="0.95" />
            </linearGradient>
          ))}
          <filter id="cur-glow"><feGaussianBlur stdDeviation="2.4" /></filter>
          <filter id="thr-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>

        {/* light rays spilling outward from the opening */}
        <g opacity="0.4">
          {[-30, -12, 6, 24].map((a, i) => (
            <polygon key={i}
              points={`${cx},${top + (floor - top) * 0.42} ${cx - 1000 * Math.sin((a - 6) * Math.PI / 180)},${-40} ${cx - 1000 * Math.sin((a + 6) * Math.PI / 180)},${-40}`}
              fill="url(#thr-open)" opacity="0.1" />
          ))}
        </g>

        {/* bright inner opening spilling light (gently breathing + extra parallax depth) */}
        <motion.g style={{ x: innerX, y: innerY }} {...(reduce ? {} : { animate: { opacity: [0.82, 1, 0.82] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } })}>
          <path d={`${archPath(0.3)} Z`} fill="url(#thr-open)" />
          <path d={`${archPath(0.16)} Z`} fill="#ffffff" fillOpacity="0.9" />
        </motion.g>

        {/* nested arches with depth */}
        {arches.map((a, i) => (
          <g key={i}>
            <path d={archPath(a.s)} fill="none" stroke={a.color} strokeOpacity={a.op * 0.5} strokeWidth={(3 - i * 0.3)} filter="url(#cur-glow)" />
            <path d={archPath(a.s)} fill="none" stroke={a.color} strokeOpacity={a.op} strokeWidth={2.2 - i * 0.22} strokeLinecap="round" />
          </g>
        ))}
        {/* light travelling gently along the outermost arch edge */}
        {!reduce && (
          <motion.path d={archPath(1.0)} fill="none" stroke="#bcd2ff" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="60 900" filter="url(#cur-glow)"
            animate={{ strokeDashoffset: [960, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        )}

        {/* reflective floor line + mirrored base glow */}
        <line x1="80" y1={floor} x2="1440" y2={floor} stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
        <ellipse cx={cx} cy={floor + 22} rx={halfW * 1.1} ry="30" fill="url(#thr-floorrefl)" opacity="0.55" filter="url(#cur-glow)" />

        {/* four continuous spectrum currents + travelling highlights */}
        {currents.map((c) => (
          <motion.g key={c.id} {...(reduce ? {} : { animate: { y: [0, c.wob, 0] }, transition: { duration: c.dur, repeat: Infinity, ease: "easeInOut" } })}>
            <path d={c.d} fill="none" stroke={`url(#cur-${c.id})`} strokeWidth={c.w + 3} strokeOpacity="0.26" strokeLinecap="round" filter="url(#cur-glow)" />
            <path d={c.d} fill="none" stroke={`url(#cur-${c.id})`} strokeWidth={c.w} strokeOpacity="0.95" strokeLinecap="round" />
            {!reduce && (
              <motion.path d={c.d} fill="none" stroke={c.hl} strokeWidth={c.w + 0.6} strokeLinecap="round"
                strokeDasharray="26 320" filter="url(#cur-glow)"
                animate={{ strokeDashoffset: [346, 0] }}
                transition={{ duration: c.dur * 0.9, repeat: Infinity, ease: "linear" }} />
            )}
          </motion.g>
        ))}
        {/* film-timeline notches on DEVELOP current (subtle, integrated) */}
        <g stroke="#f7b24a" strokeOpacity="0.55" strokeWidth="1.4">
          {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={140 + i * 60} y1={572} x2={140 + i * 60} y2={584} />)}
        </g>

        <rect width="1440" height="900" filter="url(#thr-grain)" opacity="0.045" />
      </motion.svg>

      {/* readability wash for the left editorial column */}
      <div className="absolute inset-0 bg-gradient-to-r from-ccdp-black via-ccdp-black/82 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ccdp-black via-transparent to-ccdp-black/40" />
    </div>
  );
};

export const Hero = () => {
  const { openInquiry, openBriefing } = useInquiry();
  return (
    <section id="top" data-testid="hero-section" className="relative flex min-h-screen items-center overflow-hidden">
      <ThresholdBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-5 pt-36 pb-28 md:px-10 md:pt-32 md:pb-20 lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="overline mb-6 flex items-center gap-3 text-ccdp-cream/75"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
            Creative Education · Technology · Workforce Development
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="font-display font-medium leading-[0.98] tracking-tight text-ccdp-white text-[2.9rem] sm:text-[3.6rem] lg:text-[4.6rem]"
          >
            <span className="block">A New Category of</span>
            <span className="block text-gradient">Creative Education.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="mt-6 max-w-[520px] text-[1.05rem] leading-[1.7] text-ccdp-cream/85"
          >
            CCDP™ powered by ANCR™ connects learning, creation, collaboration, ownership,
            wellness, business development, and career preparation in one comprehensive
            solution for institutions and the creators they serve.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            className="mt-5 font-display text-xl font-semibold tracking-tight text-ccdp-white"
          >
            Build the work. <span className="text-gradient">Own the future.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button type="button" onClick={openBriefing} data-testid="hero-briefing-btn"
              className="group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ccdp-gradient px-6 text-[13px] font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ccdp-black focus-visible:ring-ccdp-purple">
              Schedule an Executive Briefing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={() => openInquiry("deck")} data-testid="hero-deck-btn"
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 px-6 text-[13px] font-semibold text-ccdp-cream transition-colors duration-300 hover:border-white/60 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ccdp-black focus-visible:ring-ccdp-purple">
              <FileText className="h-4 w-4" />
              Request the Partnership Deck
            </button>
          </motion.div>
        </div>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ccdp-cream/45"
        aria-hidden="true"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.span className="block" animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="h-6 w-6" />
        </motion.span>
      </motion.div>
    </section>
  );
};
