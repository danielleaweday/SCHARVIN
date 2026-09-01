import * as Icons from "lucide-react";
import { ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Seo } from "../components/Seo";
import { Footer } from "../components/Footer";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ParallaxBand } from "../components/ParallaxBand";
import { FRAMEWORK_PILLARS, FRAMEWORK_HERO } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const CCDP_MARK = "/brand/ccdp-mark.png";
const ANCR_MARK = "/brand/modules/ancr.png";
const WORLD_MAP = "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/cf8b9f84ac899265c3c274477725edffca8b1b4a0d860fe650e69c54886e05c0.png";

const LogoLockup = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3">
    <img src={CCDP_MARK} alt="CCDP" className="h-8 w-auto object-contain md:h-9" draggable="false" />
    <span className="h-8 w-px bg-white/20" />
    <img src={ANCR_MARK} alt="ANCR" className="h-7 w-auto object-contain md:h-8" draggable="false" />
  </div>
);

/* Lightweight ambient gradient wash — static (no huge animated blur layers) */
const AmbientField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-40 top-6 h-[30rem] w-[30rem] rounded-full opacity-[0.16] blur-[90px]"
      style={{ background: "radial-gradient(circle, #2e7bff, transparent 70%)" }} />
    <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full opacity-[0.14] blur-[90px]"
      style={{ background: "radial-gradient(circle, #7a3ff2, transparent 70%)" }} />
    <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full opacity-[0.10] blur-[90px]"
      style={{ background: "radial-gradient(circle, #f5a524, transparent 70%)" }} />
  </div>
);

const IconRing = ({ Icon, accent }) => (
  <span className="relative grid h-14 w-14 shrink-0 place-items-center">
    <span className="absolute inset-0 animate-spin-slow rounded-full"
      style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 40%, transparent 60%, ${accent})` }} />
    <span className="absolute inset-[2px] rounded-full bg-ccdp-charcoal" />
    <span className="relative grid h-10 w-10 place-items-center rounded-full text-white"
      style={{ background: accent, boxShadow: `0 0 20px ${accent}aa` }}>
      <Icon className="h-5 w-5" />
    </span>
  </span>
);

const PillarCard = ({ p, onLearn }) => {
  const Icon = Icons[p.icon] || Icons.Sparkles;
  return (
    <div data-testid={`pillar-${p.n}`}
      className="group relative flex min-h-[268px] overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/80 transition-transform duration-300 hover:-translate-y-1.5">
      <span className="absolute inset-x-0 top-0 z-20 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}00)` }} />
      <span className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${p.accent}80, 0 30px 80px -36px ${p.accent}` }} />

      {/* photo bleeding in from the right */}
      <div className="absolute inset-0 z-0">
        <img src={p.image} alt={p.title} draggable="false"
          className="absolute right-0 top-0 h-full w-[70%] object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, #141417 0%, #141417 32%, rgba(20,20,23,0.72) 56%, rgba(20,20,23,0) 100%)" }} />
        <div className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(120deg, ${p.accent}, transparent 60%)` }} />
      </div>

      <div className="relative z-10 flex max-w-[72%] flex-col p-6 md:max-w-[64%]">
        <IconRing Icon={Icon} accent={p.accent} />
        <h3 className="mt-4 font-display text-lg font-bold leading-tight tracking-tight" style={{ color: p.accent }}>
          {parseInt(p.n, 10)}. {p.title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ccdp-cream/70">{p.desc}</p>
        <button type="button" onClick={onLearn} data-testid={`pillar-${p.n}-learn`}
          className="group/l mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-[13px] font-semibold" style={{ color: p.accent }}>
          Learn more
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/l:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

const NODE_X = [83, 250, 417, 583, 750, 917];

const SCHOOLS = [
  { id: "ancra", logo: "/brand/modules/ancra.png", accent: "#3b82f6",
    title: "ANCRA", subtitle: "Learn · Grow · Transform",
    desc: "AI-powered learning and coaching that personalizes each creator's educational pathway." },
  { id: "cynaiah", logo: "/brand/modules/cynaiah.png", accent: "#e0349e",
    title: "CYNAIAH", subtitle: "Vision · Story · Impact",
    desc: "School of Film, Visual Storytelling & Emerging Media." },
  { id: "viearta", logo: "/brand/modules/viearta.png", accent: "#7a3ff2",
    title: "VIEARTA", subtitle: null,
    desc: "A creative school within the CCDP ecosystem. Full program details are being finalized." },
];

const PillarConvergence = () => (
  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ccdp-charcoal/80 p-6 md:p-10">
    <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
      style={{ backgroundImage: `url(${WORLD_MAP})`, backgroundSize: "cover", backgroundPosition: "center" }} />

    <div className="relative z-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {FRAMEWORK_PILLARS.map((p) => {
        const Icon = Icons[p.icon] || Icons.Sparkles;
        return (
          <div key={p.n} className="flex flex-col items-center gap-2 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-black/50"
              style={{ color: p.accent, boxShadow: `0 0 18px -4px ${p.accent}` }}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ccdp-cream/50">{p.title.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>

    <svg className="relative z-0 -mt-1 h-28 w-full md:h-36" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e7bff" />
          <stop offset="50%" stopColor="#7a3ff2" />
          <stop offset="100%" stopColor="#f5a524" />
        </linearGradient>
      </defs>
      {NODE_X.map((x, i) => (
        <path key={i} d={`M ${x} 4 C ${x} 110, 500 90, 500 194`} fill="none"
          stroke="url(#convGrad)" strokeWidth="1.6" className="flow-line" opacity="0.6" />
      ))}
    </svg>

    <div className="relative z-10 -mt-2 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
      <div className="text-center md:text-left">
        <img src={CCDP_MARK} alt="CCDP" className="mx-auto h-11 w-auto object-contain md:mx-0" draggable="false" />
        <p className="mt-3 font-display text-base font-semibold text-ccdp-white">Higher Education &amp; Training</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ccdp-cream/60">
          The new creative degree — signature learning experiences and credentials that equip students to create, own, lead, and thrive.
        </p>
      </div>

      <div className="relative mx-auto grid h-28 w-28 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full bg-ccdp-gradient opacity-70 blur-md" />
        <span className="absolute inset-[3px] rounded-full bg-ccdp-black" />
        <span className="absolute inset-[3px] rounded-full" style={{ boxShadow: "inset 0 0 20px rgba(122,63,242,0.65)" }} />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-ccdp-gradient text-white shadow-lg shadow-ccdp-purple/40">
          <InfinityIcon className="h-7 w-7" />
        </span>
      </div>

      <div className="text-center md:text-right">
        <img src={ANCR_MARK} alt="ANCR" className="mx-auto h-9 w-auto object-contain md:ml-auto md:mr-0" draggable="false" />
        <p className="mt-3 font-display text-base font-semibold text-ccdp-white">Education Technology Ecosystem</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ccdp-cream/60">
          AI-powered tools and platforms supporting discovery, development, collaboration, and career acceleration.
        </p>
      </div>
    </div>
  </div>
);

export default function Framework() {
  const { openBriefing } = useInquiry();

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Educational Framework" description="The CCDP Educational Framework — six integrated pillars uniting creative arts, technology, business, career development, leadership, and global reach, powered by the ANCR ecosystem." />
      <Navbar />

      {/* Hero */}
      <section data-testid="framework-hero" className="grain relative overflow-hidden pt-[72px]">
        <AmbientField />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-14 md:grid-cols-[1fr_1.15fr] md:gap-12 md:px-10 md:py-24">
          <div>
            <Reveal>
              <p className="overline flex items-center gap-3 text-ccdp-cream/60">
                <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Our Educational Framework
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-tight text-ccdp-white sm:text-6xl lg:text-7xl">
                Six Pillars.<br />
                <span className="text-gradient">One Purpose.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <span className="mt-5 block h-1 w-44 rounded-full bg-ccdp-gradient" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 font-display text-base font-semibold uppercase tracking-[0.1em] text-ccdp-blue">
                Educating creators. Equipping leaders. Expanding access.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ccdp-cream/75">
                The CCDP Framework is an integrated model that prepares students to create,
                innovate, lead, and impact the world through creativity, technology, business,
                and purpose — powered by the ANCR ecosystem.
              </p>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-9 w-fit"><LogoLockup /></div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-[1.5px] rounded-[1.6rem] bg-ccdp-gradient opacity-60" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10">
                <img src={FRAMEWORK_HERO} alt="CCDP educational framework"
                  className="h-full w-full object-cover" draggable="false" />
                {/* Subtle orbital motion over the globe — matches the Ecosystem rings / Global Adoption map */}
                <div className="pointer-events-none absolute left-[30%] top-[48%] aspect-square w-[60%] -translate-x-1/2 -translate-y-1/2">
                  <span className="animate-breathe absolute inset-[10%] rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(46,123,255,0.45), transparent 70%)" }} />
                  <span className="animate-orbit absolute inset-0 rounded-full border border-dashed border-white/[0.14]" />
                  <span className="animate-orbit-rev absolute inset-[18%] rounded-full border border-ccdp-blue/15" />
                  <span className="animate-orbit absolute inset-0">
                    <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ccdp-blue shadow-[0_0_14px_4px_rgba(46,123,255,0.7)]" />
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ccdp-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Schools & Pathways — featured creative schools/pathways */}
      {/* Editorial band — Black & Brown creative students (parallax) */}
      <ParallaxBand
        testid="framework-editorial-band"
        image="https://images.unsplash.com/photo-1758270705317-3ef6142d306f?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000"
        alt="Black and Brown creative students collaborating on campus"
        tint="linear-gradient(115deg, rgba(122,63,242,0.30), transparent 45%, rgba(46,123,255,0.26))"
        overline="Creative Education"
        headline="A campus for creators — where talent becomes a career."
      />

      <section data-testid="schools-pathways" className="relative overflow-hidden border-t border-white/5 section-rich py-16 md:py-24">
        <AmbientField />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="max-w-2xl">
            <Reveal><p className="overline text-ccdp-purple">Schools &amp; Pathways</p></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-ccdp-white sm:text-5xl">
                Focused creative <span className="text-gradient">schools &amp; pathways.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 text-base leading-relaxed text-ccdp-cream/65">
                CCDP students move through focused, industry-aligned schools and creative pathways —
                each powered by the ANCR ecosystem.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {SCHOOLS.map((s) => (
              <StaggerItem key={s.id}>
                <div data-testid={`school-${s.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/80 p-7 transition-transform duration-300 hover:-translate-y-1.5">
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }} />
                  <div className="flex h-20 items-center">
                    <img src={s.logo} alt={s.title} className="max-h-16 max-w-[80%] object-contain object-left" draggable="false" />
                  </div>
                  <p className="mt-5 font-display text-lg font-semibold tracking-tight text-ccdp-white">{s.title}</p>
                  {s.subtitle && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-gradient">{s.subtitle}</p>}
                  <p className="mt-3 text-sm leading-relaxed text-ccdp-cream/65">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Six pillars */}
      <section className="relative overflow-hidden border-t border-white/5 section-rich py-16 md:py-24">
        <AmbientField />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] opacity-[0.06]"
          style={{ backgroundImage: `url(${WORLD_MAP})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="text-center">
            <Reveal>
              <p className="overline text-ccdp-purple">The CCDP Framework</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-ccdp-white sm:text-5xl">
                Six Pillars. <span className="text-gradient">One Integrated Future.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/65">
                Our six pillars work together to create a transformative educational experience
                that prepares students for meaningful careers and global reach.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORK_PILLARS.map((p) => (
              <StaggerItem key={p.title}>
                <PillarCard p={p} onLearn={openBriefing} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Convergence — pillars feed into CCDP + ANCR */}
      <section className="relative overflow-hidden border-t border-white/5 section-rich py-16 md:py-24">
        <AmbientField />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline text-center text-ccdp-purple">One ecosystem. Endless possibilities.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-ccdp-cream/65">
              Every pillar flows into CCDP and ANCR — working together to discover, develop, and
              deploy the next generation of creative leaders worldwide.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-12"><PillarConvergence /></div>
          </Reveal>
        </div>
      </section>

      {/* Concluding statement */}
      <section data-testid="framework-statement" className="border-t border-white/5 section-rich py-16 md:py-24">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ccdp-charcoal/80 p-9 text-center md:p-14">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ccdp-gradient opacity-70" />
              <p className="relative mx-auto max-w-4xl font-display text-2xl font-medium leading-snug tracking-tight text-ccdp-white sm:text-3xl md:text-[2.15rem] md:leading-[1.28]">
                Every CCDP program, credential, experience, and technology platform is intentionally
                designed around this Educational Framework — ensuring every learner graduates with
                <span className="text-gradient"> creative excellence, technological fluency, entrepreneurial confidence, leadership capacity, and global perspective.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5 section-rich py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-50"
          style={{ backgroundImage: `url(${FRAMEWORK_HERO})`, backgroundSize: "cover", backgroundPosition: "left center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ccdp-black via-ccdp-black/85 to-ccdp-black/70" />
        <div className="relative mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-5 text-center md:px-10">
          <Reveal>
            <h2 className="max-w-3xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl md:text-5xl">
              Educating creators. Equipping leaders. Expanding access.{" "}
              <span className="text-gradient">Reaching the world.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <button type="button" onClick={openBriefing} data-testid="framework-cta-btn"
              className="group inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ccdp-purple/25 transition-transform duration-300 hover:-translate-y-0.5">
              Schedule an Executive Briefing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="text-sm text-ccdp-cream/55">Let's build the future together.</p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
