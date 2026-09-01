import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, fadeUp, staggerContainer } from "@/components/common";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [dests, setDests] = useState(null);
  const [q, setQ] = useState(params.get("q") || "");

  const load = (query) => {
    api.get("/destinations", { params: query ? { q: query } : {} }).then((r) => setDests(r.data));
  };
  useEffect(() => { load(params.get("q") || ""); }, []); // eslint-disable-line

  const onSearch = (e) => {
    e.preventDefault();
    setParams(q ? { q } : {});
    load(q);
  };

  const toggleSave = async (e, id) => {
    e.preventDefault();
    const { data } = await api.post(`/destinations/${id}/save`);
    setDests((prev) => prev.map((d) => (d.id === id ? { ...d, saved: data.saved } : d)));
    toast[data.saved ? "success" : "message"](data.saved ? "Destination saved" : "Removed from saved");
  };

  if (!dests) return <Loader label="Loading destinations" />;
  const featured = dests.find((d) => d.featured) || dests[0];

  return (
    <div data-testid="explore-page">
      <PageHeader
        eyebrow="Explore the World"
        title="Where creativity travels"
        subtitle="Browse cinematic destination profiles built for creatives — culture, industry, laws, safety and etiquette in one place."
        testid="explore-header"
      />

      <form onSubmit={onSearch} className="relative mb-8 max-w-xl" data-testid="explore-search-form">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search a country or city"
          data-testid="explore-search-input"
          className="w-full rounded-full border border-white/12 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-cyan/50"
        />
      </form>

      {featured && (
        <Link to={`/explore/${featured.id}`} data-testid={`featured-${featured.id}`}>
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="group relative mb-8 overflow-hidden rounded-3xl border border-white/10">
            <img src={featured.hero} alt={featured.country} className="h-[320px] w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <Pill tone="cyan" className="mb-3">Featured · {featured.match_score}% match</Pill>
              <h2 className="font-display text-4xl font-700 text-white">{featured.flag} {featured.country}</h2>
              <p className="mt-1 max-w-md text-white/70">{featured.tagline}</p>
            </div>
          </motion.div>
        </Link>
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dests.map((d) => (
          <motion.div key={d.id} variants={fadeUp}>
            <Link to={`/explore/${d.id}`} data-testid={`destination-card-${d.id}`}>
              <GlassCard hover className="group h-full overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={d.thumb} alt={d.country} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />
                  <button
                    onClick={(e) => toggleSave(e, d.id)}
                    data-testid={`save-destination-${d.id}`}
                    className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/50 p-2 text-white backdrop-blur-md transition hover:border-cyan/50"
                  >
                    {d.saved ? <BookmarkCheck className="h-4 w-4 text-cyan" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-2xl">{d.flag}</span>
                    <span className="font-display text-2xl font-600 text-white">{d.country}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-snug text-white/60">{d.tagline}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Pill tone="violet"><MapPin className="h-3 w-3" /> {d.region}</Pill>
                    <Pill tone="amber">{d.match_score}% match</Pill>
                  </div>
                  <div className="mt-3 font-mono-p text-[11px] text-white/40">{d.languages.join(", ")} · {d.currency}</div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      {dests.length === 0 && (
        <div className="py-20 text-center text-white/50" data-testid="no-results">No destinations match "{q}". Try another country or city.</div>
      )}
    </div>
  );
}
