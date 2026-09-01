import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Users, User, ArrowRight, Calendar } from "lucide-react";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Ring, fadeUp, staggerContainer } from "@/components/common";
import { fmtDateRange } from "@/lib/format";

export default function MyTrips() {
  const [trips, setTrips] = useState(null);
  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);
  if (!trips) return <Loader label="Loading your trips" />;

  return (
    <div data-testid="my-trips-page">
      <PageHeader eyebrow="My Trips" title="Journeys in motion"
        subtitle="Track every creative journey — preparation, itinerary, documents, culture and team, all in one place."
        testid="my-trips-header" />

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {trips.map((t) => (
          <motion.div key={t.id} variants={fadeUp}>
            <Link to={`/trips/${t.id}`} data-testid={`trip-card-${t.id}`}>
              <GlassCard hover className="group h-full overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img src={t.cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] via-[#0B1021]/40 to-transparent" />
                  <div className="absolute right-3 top-3"><Ring value={t.readiness} size={54} stroke={5} /></div>
                  <div className="absolute bottom-3 left-4">
                    <Pill tone="amber" className="mb-2">{t.status}</Pill>
                    <h3 className="font-display text-2xl font-700 text-white">{t.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4 text-cyan" /> {t.destination}</div>
                  <div className="mt-1.5 text-sm text-white/55">{t.purpose}</div>
                  <div className="mt-2 flex items-center gap-2 font-mono-p text-[11px] text-white/45"><Calendar className="h-3.5 w-3.5" /> {fmtDateRange(t.start_date, t.end_date)}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <Pill tone={t.travel_type.toLowerCase().includes("individual") ? "violet" : "cyan"}>
                      {t.travel_type.toLowerCase().includes("individual") ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                      {t.group || t.travel_type}
                    </Pill>
                    <span className="inline-flex items-center gap-1.5 text-sm font-600 text-cyan transition-all group-hover:gap-2.5">Open trip <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
