import { useState } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, Lock, ChevronDown } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Seo } from "../components/Seo";
import { Footer } from "../components/Footer";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { useInquiry } from "../context/InquiryProvider";
import { ASSETS } from "../lib/content";

const RESOURCES = [
  { intent: "res_deck", title: "Partnership Deck", format: "Deck · PDF", desc: "The full overview of the CCDP partnership opportunity and ecosystem.", icon: "FileText" },
  { intent: "res_brief", title: "Executive Brief", format: "Brief · PDF", desc: "A concise summary of CCDP for leadership and decision-makers.", icon: "FileBadge" },
  { intent: "res_overview", title: "Institutional Overview", format: "Overview · PDF", desc: "How CCDP integrates with colleges, universities, and institutions.", icon: "Building2" },
  { intent: "res_degree", title: "The New Creative Degree", format: "Overview · PDF", desc: "CCDP's signature learning experiences, intellectual property, and credentialing model.", icon: "GraduationCap" },
  { intent: "res_ancr", title: "ANCR Platform Overview", format: "Overview · PDF", desc: "The education operating system that unifies the ecosystem.", icon: "Boxes" },
  { intent: "res_press", title: "Press Kit", format: "Media Kit", desc: "Brand assets, boilerplate, and media resources for CCDP.", icon: "Newspaper" },
];

const FAQS = [
  { q: "How do I access CCDP materials?", a: "Complete a short inquiry form for the resource you'd like. Our team will email the requested materials, typically within 1–2 business days." },
  { q: "Why do I need to submit the form first?", a: "Our institutional materials are shared with partners and stakeholders evaluating collaboration. The form lets us route the right materials and follow up appropriately." },
  { q: "Can we schedule a conversation?", a: "Yes. Use “Schedule an Executive Briefing” anywhere on the site to request a private walkthrough with our team." },
  { q: "Who is CCDP built for?", a: "Universities and colleges, foundations, employers, government and workforce agencies, and mission-aligned investors interested in the future of creative education." },
  { q: "How can our institution partner with CCDP?", a: "CCDP integrates into existing programs and initiatives. Request the Institutional Overview or reach out through any partnership inquiry to start the conversation." },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10" data-testid="faq-item">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-5 text-left">
        <span className="font-display text-lg font-medium text-ccdp-white">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ccdp-cream/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 pr-8 text-sm leading-relaxed text-ccdp-cream/65">{a}</p>}
    </div>
  );
};

export default function Resources() {
  const { openInquiry } = useInquiry();
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Resources" description="Request the CCDP partnership deck, executive brief, institutional overview, the new creative degree overview, ANCR platform overview, and press kit." />
      <Navbar />
      {/* Hero */}
      <section data-testid="resources-hero" className="grain relative overflow-hidden pt-[72px]">
        <div className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: `url(${ASSETS.mesh})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ccdp-black/50 via-ccdp-black/75 to-ccdp-black" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/70">
              <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Institutional Resources
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-tight text-ccdp-white sm:text-5xl lg:text-6xl">
              Everything you need to{" "}
              <span className="text-gradient">evaluate CCDP.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ccdp-cream/75">
              Request our institutional materials below. Complete a short form and our team
              will send your requested resources — every request is tracked so we can follow
              up with the right context.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Resource grid */}
      <section className="section-rich py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((r) => {
              const Icon = Icons[r.icon] || Icons.FileText;
              return (
                <StaggerItem key={r.intent}>
                  <div data-testid={`resource-${r.intent}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/25">
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ccdp-gradient opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-gradient">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ccdp-cream/50">
                        {r.format}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ccdp-white">{r.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ccdp-cream/60">{r.desc}</p>
                    <button data-testid={`resource-btn-${r.intent}`} onClick={() => openInquiry(r.intent)}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ccdp-white">
                      <Lock className="h-3.5 w-3.5 text-ccdp-cream/50" /> Request access
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <p className="mt-2 text-[11px] text-ccdp-cream/35">Gated · sent to your inbox on request</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-testid="resources-faq" className="border-t border-white/10 section-rich py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-5 md:px-10">
          <Reveal>
            <p className="overline flex items-center gap-3 text-ccdp-cream/50">
              <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" /> Frequently Asked Questions
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">
              Questions, answered.
            </h2>
          </Reveal>
          <div className="mt-10">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
