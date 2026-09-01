import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2, Sparkles, Mail, CheckCircle2, Clock } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { storeApi } from "../lib/storeApi";

// Official, approved campaign + merchandise artwork (stored locally under /brand/store).
const CAMPAIGN = {
  ccdp: "/brand/store/ccdp-hero.jpg",
  paramount: "/brand/store/paramount.png",
  ancrFlagship: "/brand/store/ancr-flagship.jpg",
  ancrsync: "/brand/store/ancrsync.jpg",
  viearta: "/brand/store/viearta.png",
  inheira: "/brand/store/inheira.png",
  hats: "/brand/store/hats.png",
  ancrlab: "/brand/store/ancrlab.jpg",
  ancrid: "/brand/store/ancrid.jpg",
  ancra: "/brand/store/ancra.jpg",
  cynaiah: "/brand/store/cynaiah.png",
  ancrd: "/brand/store/ancrd.jpg",
  ancrmedia: "/brand/store/ancrmedia.jpg",
};

// Editorial spotlights — clean model shots shown in a framed, alternating layout.
const SPOTLIGHTS = [
  { brand: "ANCRLAB", accent: "#a855f7", url: CAMPAIGN.ancrlab, statement: "Where creators become.",
    blurb: "Studio-born streetwear for the makers building what's next. Create with purpose. Build with vision. Leave your mark." },
  { brand: "ANCRID", accent: "#2e7bff", url: CAMPAIGN.ancrid, statement: "One ID. All access. Everywhere.",
    blurb: "A denim-forward identity collection. Built different, connected forever — be seen, be verified, belong." },
  { brand: "ANCRA", accent: "#f5a524", url: CAMPAIGN.ancra, statement: "More than a platform. A movement.",
    blurb: "Campus-ready essentials for the learning platform built for creators. Learn. Create. Own your future." },
];

// Full campaign lookbook sheets — presented as large editorial posters.
const LOOKBOOK = [
  { brand: "ANCR", accent: "#2e7bff", url: CAMPAIGN.ancrFlagship, tag: "Flagship Collection", wide: true,
    line: "Built for the culture. Designed for what's next.", sub: "Discover. Develop. Deploy. — ANCR is more than a brand. It's a movement." },
  { brand: "VIEARTA", accent: "#e0349e", url: CAMPAIGN.viearta, tag: "Lifestyle & Wellness",
    line: "Creative health, wellness & human performance.", sub: "Wear your wellness. Live your VIEARTA." },
  { brand: "INHEIRA", accent: "#7a8cff", url: CAMPAIGN.inheira, tag: "Identity & Legacy",
    line: "From creation to legacy.", sub: "Not just a brand. A system. A movement. A legacy." },
  { brand: "ANCRSYNC", accent: "#2e7bff", url: CAMPAIGN.ancrsync, tag: "Collaboration",
    line: "Create. Collaborate. Connect.", sub: "See beyond. Share impact. Live authentic." },
  { brand: "CYNAIAH", accent: "#a78bfa", url: CAMPAIGN.cynaiah, tag: "Signature Tracksuit",
    line: "Vision. Story. Impact.", sub: "Premium streetwear for storytellers and visionaries. Every thread. Every story." },
  { brand: "ANCRD", accent: "#e0349e", url: CAMPAIGN.ancrd, tag: "Community",
    line: "See beyond. Share impact.", sub: "Create. Collaborate. Connect. One community, endless possibilities." },
  { brand: "ANCR Media Network", accent: "#7a8cff", url: CAMPAIGN.ancrmedia, tag: "Media · Music · Video",
    line: "Where music lives.", sub: "ANCRMEDIA · ANCRWAV · ANCRVIEW — tribute, stream, and see beyond." },
  { brand: "The Hat Collection", accent: "#f5a524", url: CAMPAIGN.hats, tag: "Ecosystem-Wide", wide: true,
    line: "One ecosystem. Endless possibilities.", sub: "Every hat. Every detail. Every thread. Purpose." },
];

// The full ANCR Shop lineup — grouped ecosystem divisions, shown by official logo.
// Logos are served from official local brand assets (never recreated/recolored).
const COLLECTION_GROUPS = [
  {
    group: "Education",
    items: [
      { id: "ccdp", name: "CCDP", accent: "#7a3ff2", logo: "/brand/ccdp-colored.png" },
      { id: "ancra", name: "ANCRA", accent: "#f5a524", logo: "/brand/modules/ancra.png" },
      { id: "adca", name: "ADCA", accent: "#f97316", logo: "/brand/modules/adca.png" },
    ],
  },
  {
    group: "Technology",
    items: [
      { id: "ancr", name: "ANCR", accent: "#2e7bff", logo: "/brand/modules/ancr.png" },
      { id: "ancrlab", name: "ANCRLAB", accent: "#a855f7", logo: "/brand/modules/ancrlab.png" },
      { id: "ancrsync", name: "ANCRSYNC", accent: "#06b6d4", logo: "/brand/modules/ancrsync.png" },
      { id: "ancrview", name: "ANCRVIEW", accent: "#f59e0b", logo: "/brand/modules/ancrview.png" },
      { id: "ancrid", name: "ANCRID", accent: "#2e7bff", logo: "/brand/modules/ancrid.png" },
      { id: "ancrwav", name: "ANCRWAV", accent: "#f43f5e", logo: "/brand/modules/ancrwav.png" },
      { id: "ancrmedia", name: "ANCRMEDIA", accent: "#7a8cff", logo: "/brand/modules/ancrmedia.png" },
      { id: "ancrd", name: "ANCRD", accent: "#e0349e", logo: "/brand/modules/ancrd.png" },
      { id: "cynaiah", name: "CYNAIAH", accent: "#e0349e", logo: "/brand/modules/cynaiah.png" },
      { id: "inheira", name: "INHEIRA", accent: "#7a8cff", logo: "/brand/modules/inheira.png" },
      { id: "vaulta", name: "VAULTA", accent: "#10b981", logo: "/brand/modules/vaulta.png" },
      { id: "passport", name: "PASSPORT", accent: "#eab308", logo: "/brand/modules/passport.png" },
    ],
  },
  {
    group: "Lifestyle & Wellness",
    items: [
      { id: "viearta", name: "VIEARTA", accent: "#e0349e", logo: "/brand/modules/viearta.png" },
      { id: "coheir", name: "COHEIR", accent: "#ec4899", logo: "/brand/modules/coheir.png" },
    ],
  },
];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// Reusable cinematic background — layered spectrum glows + architectural grid.
function Atmosphere({ orbs = "default", grid = true, seam = true }) {
  const sets = {
    default: [
      { c: "#2e7bff", cls: "-left-40 top-0 h-[30rem] w-[30rem]", o: 0.16 },
      { c: "#e0349e", cls: "right-0 top-24 h-[28rem] w-[28rem]", o: 0.14 },
      { c: "#f5a524", cls: "bottom-0 left-1/3 h-[24rem] w-[24rem]", o: 0.1 },
    ],
    violet: [
      { c: "#7a3ff2", cls: "-right-32 top-10 h-[32rem] w-[32rem]", o: 0.16 },
      { c: "#2e7bff", cls: "-left-32 bottom-0 h-[28rem] w-[28rem]", o: 0.12 },
    ],
    magenta: [
      { c: "#e0349e", cls: "-left-32 top-10 h-[30rem] w-[30rem]", o: 0.15 },
      { c: "#f5a524", cls: "-right-24 bottom-0 h-[26rem] w-[26rem]", o: 0.11 },
    ],
  };
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {grid && <div className="absolute inset-0 bg-grid opacity-60" />}
      {seam && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />}
      {sets[orbs].map((o, i) => (
        <div key={i} className={`absolute rounded-full blur-[120px] ${o.cls}`} style={{ opacity: o.o, background: `radial-gradient(circle,${o.c},transparent 70%)` }} />
      ))}
    </div>
  );
}

function WaitlistForm() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await storeApi.post("/waitlist", form);
      setDone(true);
      toast.success("You're on the list.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none";

  if (done) {
    return (
      <div data-testid="waitlist-success" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ccdp-gradient text-white"><CheckCircle2 className="h-7 w-7" /></span>
        <p className="font-display text-xl font-semibold text-ccdp-white">You're on the list.</p>
        <p className="max-w-sm text-sm text-ccdp-cream/60">Thank you for joining. We'll be in touch with launch announcements and early access.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row" data-testid="waitlist-form">
      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" data-testid="waitlist-name" className={input} />
      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" data-testid="waitlist-email" className={input} />
      <button type="submit" disabled={loading} data-testid="waitlist-submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ccdp-gradient px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Join the Waitlist <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}

function CampaignFrame({ url, accent, alt }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-5 rounded-[2rem] opacity-40 blur-3xl" style={{ background: `radial-gradient(circle,${accent},transparent 70%)` }} />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/60">
        <img src={url} alt={alt} loading="lazy" className="mx-auto block max-h-[640px] w-full object-contain" />
      </div>
    </div>
  );
}

function PosterFrame({ item }) {
  return (
    <Reveal>
      <div data-testid={`lookbook-${item.brand.replace(/\s+/g, "").toLowerCase()}`} className="group relative">
        <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-35 blur-3xl transition-opacity duration-500 group-hover:opacity-55" style={{ background: `radial-gradient(circle,${item.accent},transparent 70%)` }} />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/70">
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px]" style={{ background: `linear-gradient(90deg,transparent,${item.accent},transparent)` }} />
          <img src={item.url} alt={`${item.brand} campaign`} loading="lazy" className="block w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
        </div>
        <div className="mt-5 flex flex-col gap-1.5 px-1">
          <div className="flex items-center gap-3">
            <p className="overline" style={{ color: item.accent }}>{item.brand}</p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ccdp-cream/40">{item.tag}</span>
          </div>
          <p className="font-display text-lg font-medium tracking-tight text-ccdp-white sm:text-xl">{item.line}</p>
          <p className="text-sm text-ccdp-cream/55">{item.sub}</p>
        </div>
      </div>
    </Reveal>
  );
}

function CollectionCard({ c }) {
  return (
    <div
      data-testid={`collection-${c.id}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ccdp-charcoal/70 to-ccdp-black transition-all duration-500 hover:-translate-y-1.5 hover:border-white/25"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 transition-opacity duration-500 group-hover:opacity-60" style={{ background: `radial-gradient(80% 70% at 50% 22%, ${c.accent}, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg,transparent,${c.accent},transparent)` }} />

      <div className="relative flex flex-1 items-center justify-center px-6 pt-7">
        <img src={c.logo} alt={`${c.name} logo`} loading="lazy" className="max-h-24 max-w-[80%] object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-[1.05] sm:max-h-28" />
      </div>

      <div className="relative flex flex-col items-center gap-2.5 px-4 pb-6 text-center">
        <span className="font-display text-sm font-medium tracking-[0.12em] text-ccdp-white sm:text-base">{c.name}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-ccdp-cream/70">
          <Clock className="h-2.5 w-2.5" /> Coming Soon
        </span>
      </div>
    </div>
  );
}

export default function Store() {
  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="ANCR Shop" description="The Official Merchandise of the ANCR Ecosystem. Premium apparel and accessories for creators, innovators, artists, entrepreneurs, and visionaries — launching soon. Join the waitlist." />
      <Navbar />

      {/* Hero */}
      <section data-testid="shop-hero" className="relative overflow-hidden pt-[128px] md:pt-[150px]">
        <Atmosphere orbs="default" seam={false} />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <div className="mb-8 inline-flex rounded-2xl bg-white p-5 shadow-2xl shadow-black/50 ring-1 ring-white/15 sm:p-6">
                <img src="/brand/store/ancr-shop-logo.png" alt="ANCR Shop — Apparel, Gear, Tools, Creator Essentials" className="h-28 w-auto object-contain sm:h-36" />
              </div>
            </Reveal>
            <Reveal><p className="overline inline-flex items-center gap-2 text-ccdp-cream/70"><Sparkles className="h-4 w-4" /> Launching Soon</p></Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-5xl font-medium leading-[1.0] tracking-tight text-ccdp-white sm:text-6xl lg:text-7xl">
                ANCR <span className="text-gradient">Shop</span>
              </h1>
            </Reveal>
            <Reveal delay={0.18}><p className="mt-6 text-lg font-medium text-ccdp-cream/85 md:text-xl">The Official Merchandise of the ANCR Ecosystem</p></Reveal>
            <Reveal delay={0.26}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ccdp-cream/65">
                Premium apparel and accessories created for creators, innovators, artists, entrepreneurs, and visionaries. Our first collections are currently in production and will be available soon.
              </p>
            </Reveal>
            <Reveal delay={0.34}>
              <div className="mt-9 flex flex-wrap gap-3">
                <button onClick={() => scrollTo("waitlist")} data-testid="hero-join-waitlist" className="inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Join the Waitlist <ArrowRight className="h-4 w-4" /></button>
                <button onClick={() => scrollTo("collections")} data-testid="hero-explore" className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-ccdp-white transition-colors hover:border-white/50">Explore Collections</button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <CampaignFrame url={CAMPAIGN.ccdp} accent="#7a3ff2" alt="CCDP × ANCR campaign" />
          </Reveal>
        </div>
      </section>

      {/* The Paramount Fashion Line — immersive campaign feature */}
      <section data-testid="shop-paramount" className="relative overflow-hidden bg-ccdp-black py-16 md:py-24">
        <Atmosphere orbs="violet" />
        <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="overline text-ccdp-cream/50">The Paramount Fashion Line</p>
              <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl md:text-5xl">Built for creators. Made to lead. Designed to impact.</h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ccdp-cream/65">The debut CCDP × ANCR campaign — where the movement takes shape. Create. Develop. Deploy.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="group relative mt-12">
              <div className="pointer-events-none absolute -inset-8 rounded-[3rem] opacity-40 blur-3xl" style={{ background: "linear-gradient(115deg,#2e7bff,#7a3ff2,#e0349e,#f5a524)" }} />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/70">
                <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-ccdp-gradient opacity-80" />
                <img src={CAMPAIGN.paramount} alt="CCDP The Paramount Fashion Line campaign" loading="lazy" className="mx-auto block w-full max-w-[880px] object-contain" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Editorial campaign spotlights */}
      <section id="collections" data-testid="shop-collections" className="relative scroll-mt-28 overflow-hidden bg-gradient-to-b from-ccdp-charcoal/40 via-ccdp-black to-ccdp-black py-16 md:py-24">
        <Atmosphere orbs="magenta" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline text-ccdp-cream/50">Featured Campaigns</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">The look of the movement.</h2>
          </Reveal>
          <div className="mt-14 space-y-20 md:space-y-28">
            {SPOTLIGHTS.map((c, i) => (
              <Reveal key={c.brand}>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <CampaignFrame url={c.url} accent={c.accent} alt={`${c.brand} campaign`} />
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""} data-testid={`spotlight-${c.brand.replace(/\s+/g, "").toLowerCase()}`}>
                    <p className="overline" style={{ color: c.accent }}>{c.brand}</p>
                    <h3 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">{c.statement}</h3>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-ccdp-cream/65">{c.blurb}</p>
                    <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ccdp-cream/80">
                      <Clock className="h-3 w-3" /> Collection Coming Soon
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Lookbook — full campaign posters */}
      <section data-testid="shop-lookbook" className="relative overflow-hidden bg-ccdp-black py-16 md:py-24">
        <Atmosphere orbs="default" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline text-ccdp-cream/50">The Lookbook</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Each collection, its own story.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ccdp-cream/60">One ecosystem. Distinct identities. Explore the debut campaigns across the ANCR family of brands.</p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:gap-14 lg:grid-cols-2">
            {LOOKBOOK.map((item) => (
              <div key={item.brand} className={item.wide ? "lg:col-span-2" : ""}>
                <PosterFrame item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The full lineup — grouped by ecosystem division */}
      <section data-testid="shop-lineup" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-ccdp-black via-ccdp-charcoal/40 to-ccdp-black py-16 md:py-24">
        <Atmosphere orbs="violet" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <p className="overline text-ccdp-cream/50">The Collections</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">The complete ecosystem, one wardrobe.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ccdp-cream/60">Every collection is its own story — unified under the ANCR ecosystem. Explore by division.</p>
          </Reveal>
          <div className="mt-14 space-y-14 md:space-y-20">
            {COLLECTION_GROUPS.map((g) => (
              <Reveal key={g.group}>
                <div data-testid={`collection-group-${g.group.replace(/[^a-z]+/gi, "-").toLowerCase()}`}>
                  <div className="mb-7 flex items-center gap-4">
                    <h3 className="font-display text-lg font-medium uppercase tracking-[0.22em] text-ccdp-white">{g.group}</h3>
                    <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                    <span className="text-xs font-medium text-ccdp-cream/40">{g.items.length}</span>
                  </div>
                  <Stagger className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
                    {g.items.map((c) => (
                      <StaggerItem key={c.id}>
                        <CollectionCard c={c} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Collection */}
      <section data-testid="founders-collection" className="relative overflow-hidden bg-ccdp-black py-20 md:py-28">
        <Atmosphere orbs="magenta" />
        <div className="relative mx-auto grid max-w-[1300px] items-center gap-12 px-5 md:grid-cols-2 md:px-10 md:gap-16">
          <Reveal>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-40 blur-3xl" style={{ background: "radial-gradient(circle,#e0349e,transparent 70%)" }} />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/70">
                <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-ccdp-gradient opacity-80" />
                <img src={CAMPAIGN.inheira} alt="INHEIRA founder's campaign" loading="lazy" className="block w-full object-contain" />
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal><p className="overline text-ccdp-cream/50">Founder's Collection</p></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight text-ccdp-white sm:text-4xl">The beginning of the movement.</h2>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ccdp-cream/70 md:text-lg">
                These inaugural collections represent the beginning of the ANCR ecosystem. Every piece has been intentionally designed to reflect creativity, innovation, and excellence. We're putting the finishing touches on production and look forward to sharing them with you soon.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <button onClick={() => scrollTo("waitlist")} data-testid="founders-join-waitlist" className="mt-9 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Join the Waitlist <ArrowRight className="h-4 w-4" /></button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Join the Waitlist */}
      <section id="waitlist" data-testid="shop-waitlist" className="relative scroll-mt-28 overflow-hidden border-y border-white/10 bg-gradient-to-b from-ccdp-charcoal/40 via-ccdp-black to-ccdp-black py-20 md:py-28">
        <Atmosphere orbs="default" />
        <div className="relative mx-auto max-w-[900px] px-5 text-center md:px-10">
          <Reveal><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-gradient"><Mail className="h-6 w-6" /></span></Reveal>
          <Reveal delay={0.1}><h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-ccdp-white sm:text-4xl">Be First to Know</h2></Reveal>
          <Reveal delay={0.18}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ccdp-cream/65">
              Join our mailing list to receive launch announcements, exclusive releases, limited-edition collections, and early access to the ANCR Shop.
            </p>
          </Reveal>
          <Reveal delay={0.26}><div className="mt-9"><WaitlistForm /></div></Reveal>
        </div>
      </section>

      {/* Launching Soon callout */}
      <section data-testid="launching-soon" className="relative overflow-hidden section-rich py-28 md:py-44">
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="absolute left-1/2 top-1/2 h-[34rem] w-[64rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]" style={{ background: "linear-gradient(90deg,#2e7bff,#7a3ff2,#e0349e,#f5a524)" }} />
        </div>
        <div className="relative mx-auto max-w-[1100px] px-5 text-center md:px-10">
          <p className="overline inline-flex items-center gap-2 text-ccdp-cream/70"><Clock className="h-4 w-4" /> The ANCR Shop</p>
          <h2 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.92] tracking-tight text-gradient sm:text-7xl md:text-8xl lg:text-9xl">Launching Soon</h2>
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl font-medium leading-snug text-ccdp-white sm:text-2xl md:text-3xl">The first official apparel collections from the ANCR ecosystem are currently in development.</p>
          <p className="mt-4 text-base text-ccdp-cream/60 md:text-lg">Stay connected for exclusive early access.</p>
          <button onClick={() => scrollTo("waitlist")} data-testid="launching-join-waitlist" className="mt-10 inline-flex items-center gap-2 rounded-full bg-ccdp-gradient px-8 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Join the Waitlist <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
