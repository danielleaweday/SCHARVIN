import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import api from "@/lib/api";
import ProductRail from "@/components/ProductRail";
import PlaceholderMedia from "@/components/PlaceholderMedia";

export default function Home({ onOpenAIAH }) {
  const [campaigns, setCampaigns] = useState([]);
  const [collections, setCollections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    api.get("/campaigns").then((r) => setCampaigns(r.data)).catch(() => {});
    api.get("/collections?featured=true").then((r) => setCollections(r.data)).catch(() => {});
    api.get("/departments").then((r) => setDepartments(r.data)).catch(() => {});
    api.get("/recommendations?limit=10").then((r) => setRecs(r.data)).catch(() => {});
  }, []);

  const getCol = (slug) => collections.find((c) => c.slug === slug);
  const hero = campaigns[0];

  return (
    <div>
      {/* HERO */}
      <section className="noise relative flex min-h-[92vh] items-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <PlaceholderMedia icon="Sparkles" accent="a" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-[1600px] px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="mb-5 font-body text-sm uppercase tracking-[0.3em] text-white/60">
              {hero?.eyebrow || "The Creator Commerce Platform"}
            </p>
            <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
              {hero ? (
                hero.title
              ) : (
                <>
                  Everything the <span className="text-ccdp-gradient italic">creator</span> needs.
                </>
              )}
            </h1>
            <p className="mt-7 max-w-xl font-body text-lg font-light leading-relaxed text-white/70">
              {hero?.body ||
                "One trusted marketplace to learn, create, build, launch, perform and grow — from apparel and instruments to cameras, software and studios."}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={hero?.cta_link || "/departments"}
                data-testid="hero-cta"
                className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 font-head text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
              >
                {hero?.cta || "Explore marketplaces"}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={onOpenAIAH}
                data-testid="hero-aiah"
                className="flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-head text-sm font-medium text-white transition-colors hover:border-white/50"
              >
                <Sparkles size={16} className="text-[#ff2bd0]" />
                Shop with AIAH
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARKETPLACES GRID */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 font-body text-xs uppercase tracking-[0.22em] text-white/40">
                19 premium departments
              </p>
              <h2 className="font-head text-3xl font-semibold tracking-tight md:text-4xl">
                Explore the marketplaces
              </h2>
            </div>
            <Link to="/departments" className="hidden font-body text-sm text-white/60 hover:text-white md:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {departments.slice(0, 8).map((d, i) => {
              const Icon = Icons[d.icon] || Icons.Store;
              return (
                <Link key={d.slug} to={`/shop/${d.slug}`} data-testid={`dept-tile-${d.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                    className="hover-media group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-white/5 p-5"
                  >
                    <PlaceholderMedia icon={d.icon} accent={d.accent} className="absolute inset-0 h-full w-full" iconClassName="!size-24" />
                    <div className="relative z-10 flex justify-end">
                      <ArrowUpRight size={18} className="text-white/40 transition-all group-hover:text-white" />
                    </div>
                    <div className="media-inner relative z-10">
                      <Icon size={22} className="mb-3 text-white/80" strokeWidth={1.4} />
                      <h3 className="font-head text-base font-semibold leading-tight">{d.name}</h3>
                      <p className="mt-1 font-body text-xs text-white/40">{d.product_count} products</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAMPAIGN LOOKBOOK */}
      <Lookbook campaigns={campaigns} />

      <ProductRail
        title="New Arrivals"
        subtitle="Fresh into the ecosystem"
        products={getCol("new-arrivals")?.products || []}
        viewAll="/collections/new-arrivals"
      />

      <ProductRail
        title="Trending Now"
        subtitle="What creators are buying"
        products={getCol("trending-now")?.products || []}
        viewAll="/collections/trending-now"
      />

      <ProductRail
        title="Creator Picks"
        subtitle="Curated by verified ANCR creators"
        products={getCol("creator-picks")?.products || []}
        viewAll="/collections/creator-picks"
      />

      <ProductRail
        title="Recommended for you"
        subtitle="Personalized selection"
        products={recs}
        viewAll="/departments"
      />

      {/* AIAH banner */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="noise relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-16">
            <div className="absolute inset-0 bg-ccdp-gradient opacity-10" />
            <div className="relative max-w-2xl">
              <Sparkles size={28} className="mb-5 text-[#ff2bd0]" />
              <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">
                Meet AIAH, your creator concierge
              </h2>
              <p className="mt-5 font-body text-lg font-light text-white/70">
                "I'm starting a podcast under $1,000." "I'm a film student — what do I need this
                semester?" Tell AIAH your goal and get a complete, budget-aware shopping list in
                seconds.
              </p>
              <button
                onClick={onOpenAIAH}
                data-testid="aiah-banner-cta"
                className="mt-8 flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-head text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
              >
                Start a conversation <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Lookbook({ campaigns }) {
  const items = (campaigns || []).filter((c) => c.image);
  if (!items.length) return null;
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-10">
          <p className="mb-2 font-body text-xs uppercase tracking-[0.22em] text-white/40">
            The Lookbook
          </p>
          <h2 className="font-head text-3xl font-semibold tracking-tight md:text-4xl">
            Editorial campaigns
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((c, i) => (
            <Link
              key={c.slug}
              to={c.cta_link}
              data-testid={`campaign-${c.slug}`}
              className="hover-media group relative block overflow-hidden rounded-3xl border border-white/10"
            >
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="media-inner w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
                <div>
                  <p className="mb-1 font-body text-[11px] uppercase tracking-[0.22em] text-white/70">
                    {c.eyebrow}
                  </p>
                  <h3 className="font-head text-lg font-semibold text-white md:text-xl">{c.title}</h3>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/40 bg-black/40 px-4 py-2 font-head text-xs text-white backdrop-blur transition-all group-hover:bg-white group-hover:text-black sm:inline-flex">
                  {c.cta} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
