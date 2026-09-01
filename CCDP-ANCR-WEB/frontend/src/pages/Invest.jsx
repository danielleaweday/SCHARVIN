import { TrendingUp, Layers, Users, Handshake, Building2, Rocket, Landmark, HeartHandshake, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ParallaxBand } from "../components/ParallaxBand";
import { useInquiry } from "../context/InquiryProvider";

const WHY = [
  { icon: Layers, title: "One connected model", desc: "CCDP powered by ANCR unites higher education, technology, industry mentorship, and career development into a single continuous experience — closing the gaps between learning and livelihood." },
  { icon: Rocket, title: "Built for the creative economy", desc: "The way creators learn, work, and earn has changed. CCDP is designed for how creative careers are actually built today — across disciplines, tools, and borders." },
  { icon: Users, title: "Institution-ready by design", desc: "ANCR is the operating system that lets colleges, universities, and partners adopt the model without rebuilding it — scalable infrastructure for creative education." },
];

const SUPPORTS = [
  { icon: Building2, title: "Platform & technology", desc: "Continued development of the ANCR operating system and its connected applications." },
  { icon: Users, title: "Institutional adoption", desc: "Bringing the CCDP model to more colleges, universities, and partners." },
  { icon: TrendingUp, title: "Ecosystem growth", desc: "Expanding the creative-economy tools, mentorship network, and pathways that help creators thrive." },
  { icon: Rocket, title: "Access & scale", desc: "Reaching more creators across more disciplines, regions, and communities." },
];

const INVESTORS = [
  { icon: Rocket, label: "Angel Investors" },
  { icon: TrendingUp, label: "Venture Capital" },
  { icon: Landmark, label: "Institutional, Corporate & Strategic Investors" },
  { icon: Building2, label: "Family Offices" },
];

export default function Invest() {
  const { openInquiry } = useInquiry();
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Invest in the Future of Creative Education" description="Invest in CCDP powered by ANCR — a connected model uniting higher education, technology, industry, and career development for the creative economy." />
      <Navbar />

      {/* Hero */}
      <section data-testid="invest-hero" className="relative overflow-hidden pt-[128px] md:pt-[150px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full opacity-[0.18] blur-[110px]" style={{ background: "radial-gradient(circle,#2e7bff,transparent 70%)" }} />
          <div className="absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full opacity-[0.16] blur-[110px]" style={{ background: "radial-gradient(circle,#f5a524,transparent 70%)" }} />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal><p className="overline flex items-center gap-3 text-ccdp-cream/70"><span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Investment</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              Invest in the Future of <span className="text-gradient">Creative Education.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-ccdp-cream/75">
              Too many talented creators never reach sustainable careers—not because they lack talent, but because they lack access to the teams, technology, funding, education, mentorship, and industry opportunities needed to thrive. CCDP powered by ANCR was created to close that gap.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => openInquiry("invest")} data-testid="invest-cta-primary" className="inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Connect with Our Team <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => openInquiry("deck")} data-testid="invest-cta-deck" className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-ccdp-white transition-colors hover:border-white/50">Request the Investor Overview</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Editorial band — diverse creative collaboration (parallax) */}
      <ParallaxBand
        testid="invest-editorial-band"
        image="https://images.unsplash.com/photo-1763480521691-7a2bf96956ef?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000"
        alt="Black music producer working in a recording studio"
        tint="linear-gradient(115deg, rgba(46,123,255,0.30), transparent 45%, rgba(224,52,158,0.28))"
        overline="The Creative Economy"
        headline="Talent is everywhere. Access isn't. We're building the bridge."
      />

      {/* Why we exist */}
      <section className="section-rich py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal><h2 className="max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Why CCDP powered by ANCR exists.</h2></Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {WHY.map((w) => (
              <StaggerItem key={w.title}>
                <div className="group h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-7 transition-all hover:-translate-y-1 hover:border-white/25">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-gradient"><w.icon className="h-5 w-5" /></span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-ccdp-white">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/65">{w.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Market opportunity */}
      <section className="border-y border-white/10 section-rich-alt py-16 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-2 md:px-10">
          <Reveal>
            <p className="overline text-ccdp-cream/50">The Opportunity</p>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">A large, evolving market that traditional models don't fully serve.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-base leading-relaxed text-ccdp-cream/70">
              <p>The creative economy spans music, film, design, media, and the technologies reshaping how creative work is made and monetized. Demand for education that connects learning to real creative careers continues to grow — yet most programs still teach in isolation from the industry and infrastructure creators need.</p>
              <p>CCDP powered by ANCR positions itself at the intersection of higher education, education technology, and the creative industries — a model built to scale across institutions rather than replace them.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What investment supports */}
      <section className="section-rich py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal><h2 className="font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">What your investment supports.</h2></Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORTS.map((s) => (
              <StaggerItem key={s.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-gradient"><s.icon className="h-5 w-5" /></span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ccdp-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/60">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Partnerships / who invests */}
      <section className="border-t border-white/10 section-rich-alt py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50"><Handshake className="h-4 w-4" /> Partnerships</p>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Who we partner with.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INVESTORS.map((i) => (
              <div key={i.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ccdp-black/40 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gradient"><i.icon className="h-5 w-5" /></span>
                <span className="text-sm font-medium text-ccdp-cream/85">{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-rich py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-5 text-center md:px-10">
          <Reveal><h2 className="font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Let's build the future of creative education together.</h2></Reveal>
          <Reveal delay={0.1}><p className="mx-auto mt-5 max-w-2xl text-lg text-ccdp-cream/70">Connect with our team to explore strategic and mission-aligned investment in CCDP powered by ANCR.</p></Reveal>
          <Reveal delay={0.2}>
            <button onClick={() => openInquiry("invest")} data-testid="invest-contact-btn" className="mt-9 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Contact the Investment Team <ArrowRight className="h-4 w-4" /></button>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
