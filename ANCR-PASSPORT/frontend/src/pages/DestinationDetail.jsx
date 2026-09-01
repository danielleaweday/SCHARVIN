import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Plus, GraduationCap, MapPin, Globe,
  Coins, Clock, CloudSun, Bus, Handshake, Utensils, Shirt, Church, Camera,
  Music, Ticket, Briefcase, Scale, Ban, Package, Phone, Building2, Accessibility,
  ShieldCheck, Heart, Users,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { GlassCard, Loader, Pill, Disclaimer } from "@/components/common";

const Section = ({ icon: Icon, title, children, legal, disclaimer }) => (
  <GlassCard className="p-6" data-testid={`dest-section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
    <div className="mb-3 flex items-center gap-2.5">
      <Icon className="h-5 w-5 text-cyan" strokeWidth={1.6} />
      <h3 className="font-display text-lg font-600 text-white">{title}</h3>
      {legal && <Pill tone="amber" className="ml-auto">Verify before travel</Pill>}
    </div>
    <div className="text-sm leading-relaxed text-white/70">{children}</div>
    {legal && <Disclaimer className="mt-4" text={disclaimer} />}
  </GlassCard>
);

const List = ({ items }) => (
  <ul className="space-y-2">
    {items.map((it, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" /> <span>{it}</span>
      </li>
    ))}
  </ul>
);

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);

  useEffect(() => { api.get(`/destinations/${id}`).then((r) => setD(r.data)); }, [id]);

  const toggleSave = async () => {
    const { data } = await api.post(`/destinations/${id}/save`);
    setD((p) => ({ ...p, saved: data.saved }));
    toast[data.saved ? "success" : "message"](data.saved ? "Destination saved" : "Removed from saved");
  };

  if (!d) return <Loader label="Loading destination" />;
  const dc = d.disclaimer;

  return (
    <div data-testid="destination-detail-page">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white" data-testid="back-btn">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10">
        <img src={d.hero} alt={d.country} className="h-[360px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <Pill tone="cyan" className="mb-3">{d.region} · {d.match_score}% match</Pill>
            <h1 className="font-display text-4xl font-700 text-white sm:text-6xl">{d.flag} {d.country}</h1>
            <p className="mt-2 max-w-xl text-white/70">{d.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={toggleSave} data-testid="detail-save-btn" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-500 text-white backdrop-blur-md transition hover:border-cyan/50">
              {d.saved ? <><BookmarkCheck className="h-4 w-4 text-cyan" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
            </button>
            <button onClick={() => { toast.success("Added to your Tokyo trip planning"); navigate("/trips"); }} data-testid="detail-add-trip-btn" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-sm font-500 text-white backdrop-blur-md transition hover:border-violet/50">
              <Plus className="h-4 w-4" /> Add to trip
            </button>
            <Link to="/culture-school/creative-collaboration-japan" data-testid="detail-lesson-btn" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-4 py-2.5 text-sm font-600 text-white transition hover:brightness-110">
              <GraduationCap className="h-4 w-4" /> Begin readiness lesson
            </Link>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Globe, label: "Languages", value: d.languages.join(", ") },
          { icon: Coins, label: "Currency", value: d.currency },
          { icon: Clock, label: "Time zone", value: d.timezones.join(", ") },
          { icon: MapPin, label: "Major cities", value: `${d.major_cities.length} cities` },
        ].map((f) => (
          <GlassCard key={f.label} className="p-4">
            <f.icon className="h-5 w-5 text-cyan" strokeWidth={1.6} />
            <div className="mt-2 text-[10px] uppercase tracking-widest text-white/40">{f.label}</div>
            <div className="mt-1 text-sm font-600 text-white">{f.value}</div>
          </GlassCard>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section icon={Globe} title="Overview">{d.overview}</Section>
        <Section icon={MapPin} title="Major Cities">
          <div className="space-y-3">
            {d.cities_detail.map((c) => (
              <div key={c.name}><span className="font-600 text-white">{c.name}</span> — {c.note}</div>
            ))}
          </div>
        </Section>
        <Section icon={CloudSun} title="Weather Overview">{d.weather}</Section>
        <Section icon={Bus} title="Transportation">{d.transportation}</Section>
        <Section icon={Handshake} title="Local Customs & Greetings">
          <p className="mb-3">{d.customs}</p>
          <List items={d.greetings} />
        </Section>
        <Section icon={Utensils} title="Dining Etiquette">{d.dining_etiquette}</Section>
        <Section icon={Shirt} title="Clothing Considerations">{d.clothing}</Section>
        <Section icon={Church} title="Religious & Social Awareness">{d.religion_social}</Section>
        <Section icon={Coins} title="Tipping Practices">{d.tipping}</Section>
        <Section icon={Camera} title="Photography & Filming">{d.photography}</Section>
        <Section icon={Music} title="Local Music & Creative Industries">{d.music_industry}</Section>
        <Section icon={Ticket} title="Performance & Venue Etiquette">{d.venue_etiquette}</Section>
        <Section icon={Briefcase} title="Business Customs">{d.business_customs}</Section>

        <Section icon={Scale} title="Laws Creatives Should Understand" legal disclaimer={dc}>
          <List items={d.laws_to_understand} />
        </Section>
        <Section icon={Ban} title="Prohibited or Restricted Conduct" legal disclaimer={dc}>
          <List items={d.prohibited_conduct} />
        </Section>
        <Section icon={Package} title="Importing Instruments, Equipment & Merchandise" legal disclaimer={dc}>
          {d.importing}
        </Section>
        <Section icon={Phone} title="Emergency Numbers" legal disclaimer={dc}>
          <div className="flex flex-wrap gap-3">
            {d.emergency_numbers.map((e) => (
              <div key={e.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/40">{e.label}</div>
                <div className="font-mono-p text-2xl font-600 text-amber">{e.number}</div>
              </div>
            ))}
          </div>
        </Section>
        <Section icon={Building2} title="Embassy & Consular Resources" legal disclaimer={dc}>{d.embassy}</Section>
        <Section icon={Accessibility} title="Accessibility Considerations">{d.accessibility}</Section>
        <Section icon={ShieldCheck} title="Safety Resources" legal disclaimer={dc}>{d.safety}</Section>
        <Section icon={Heart} title="LGBTQ+ Legal & Cultural Considerations" legal disclaimer={dc}>{d.lgbtq}</Section>
      </motion.div>
    </div>
  );
}
