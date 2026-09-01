import { GraduationCap, HeartHandshake, Cpu, Globe2, Users, HandHeart, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ParallaxBand } from "../components/ParallaxBand";
import { useInquiry } from "../context/InquiryProvider";

const PILLARS = [
  { icon: GraduationCap, title: "Scholarships & access", desc: "Helping talented creators access the education, mentorship, and opportunities they need — regardless of their starting point." },
  { icon: Cpu, title: "Technology development", desc: "Supporting the creative-education technology that connects learning, creation, and career development for creators everywhere." },
  { icon: Globe2, title: "Community & reach", desc: "Extending creative education and opportunity to more disciplines, regions, and communities." },
];

const AUDIENCES = [
  { icon: HandHeart, label: "Individual Donors" },
  { icon: Building2, label: "Foundations" },
  { icon: Sparkles, label: "Philanthropies" },
  { icon: GraduationCap, label: "Scholarship Sponsors" },
  { icon: Building2, label: "Corporate Sponsors" },
  { icon: Users, label: "Community Partners" },
];

export default function SupportUs() {
  const { openInquiry } = useInquiry();
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Support Us" description="Support Awe Day Creative Arts, Inc. — advancing access, scholarships, and creative-education technology so more creators can thrive." />
      <Navbar />

      {/* Hero */}
      <section data-testid="support-hero" className="relative overflow-hidden pt-[128px] md:pt-[150px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full opacity-[0.18] blur-[110px]" style={{ background: "radial-gradient(circle,#e0349e,transparent 70%)" }} />
          <div className="absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full opacity-[0.16] blur-[110px]" style={{ background: "radial-gradient(circle,#7a3ff2,transparent 70%)" }} />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal><p className="overline flex items-center gap-3 text-ccdp-cream/70"><span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Support Our Mission</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              Help more creators <span className="text-gradient">thrive.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-ccdp-cream/75">
              Awe Day Creative Arts, Inc. is the nonprofit at the heart of CCDP powered by ANCR. Your support advances access, scholarships, and the creative-education technology that helps talented creators reach sustainable careers.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => openInquiry("support")} data-testid="support-cta-primary" className="inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Support the Mission <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => openInquiry("support")} data-testid="support-cta-partner" className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-ccdp-white transition-colors hover:border-white/50">Become a Community Partner</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Editorial band — diverse creative community (parallax) */}
      <ParallaxBand
        testid="support-editorial-band"
        image="https://images.unsplash.com/photo-1772419168102-6191f98285d5?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000"
        alt="Black musician playing guitar in a studio session"
        tint="linear-gradient(115deg, rgba(224,52,158,0.30), transparent 45%, rgba(122,63,242,0.28))"
        overline="Community"
        headline="Access, mentorship, and opportunity — for the creators who need it most."
      />

      {/* Mission */}
      <section className="border-y border-white/10 section-rich-alt py-16 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-2 md:px-10">
          <Reveal>
            <p className="overline text-ccdp-cream/50">Our Mission</p>
            <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Access, opportunity, and creative futures.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-base leading-relaxed text-ccdp-cream/70">
              <p>Too many talented creators never reach sustainable careers — not for lack of talent, but for lack of access to education, mentorship, technology, and opportunity. Awe Day Creative Arts exists to change that.</p>
              <p>Through CCDP powered by ANCR, we're building a connected model of creative education — and philanthropic support helps make it accessible to the creators who need it most.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="section-rich py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal><h2 className="font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Where your support goes.</h2></Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="group h-full rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-7 transition-all hover:-translate-y-1 hover:border-white/25">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-gradient"><p.icon className="h-5 w-5" /></span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-ccdp-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ccdp-cream/65">{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-t border-white/10 section-rich-alt py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50"><HeartHandshake className="h-4 w-4" /> Who Supports Us</p>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Partners in the mission.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ccdp-black/40 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gradient"><a.icon className="h-5 w-5" /></span>
                <span className="text-sm font-medium text-ccdp-cream/85">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-rich py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-5 text-center md:px-10">
          <Reveal><h2 className="font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Join us in building creative futures.</h2></Reveal>
          <Reveal delay={0.1}><p className="mx-auto mt-5 max-w-2xl text-lg text-ccdp-cream/70">Reach out to explore giving, scholarships, sponsorships, or community partnership with Awe Day Creative Arts, Inc.</p></Reveal>
          <Reveal delay={0.2}>
            <button onClick={() => openInquiry("support")} data-testid="support-contact-btn" className="mt-9 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Contact Our Team <ArrowRight className="h-4 w-4" /></button>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
