import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { motion } from "framer-motion";
import { MapPin, Sparkles, GraduationCap, Users2 } from "lucide-react";

// Alumni page — showcases the "lifetime professional network" principle.
// Filters COHEIR users flagged is_alumni:true. In v1 we also include any
// professional users so the demo doesn't feel empty.
export default function Alumni() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Reuse /professionals — the alumni are seeded as verified mentors with is_alumni=true.
    api.get("/professionals?limit=200").then(({ data }) => {
      // Sort alumni first
      const alumni = data.filter((p) => p.is_alumni);
      const others = data.filter((p) => !p.is_alumni);
      setItems([...alumni, ...others.slice(0, 8)]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
          <Users2 className="w-3.5 h-3.5" /> Lifelong Network
        </div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Alumni & Career-Long Network.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          COHEIR™ is not a student mentorship platform — it is the professional relationship layer of the ANCR ecosystem.
          Every connection built during CCDP continues throughout a creator's career via ANCRID™.
        </p>
      </header>

      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-cohesion opacity-20 blur-3xl" />
        <div className="wordmark text-xl text-white mb-2">The Lifetime Relationship Principle</div>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
          Faculty, mentors, employers, executives, collaborators and alumni remain connected across the entire arc of a creator's life.
          Every review, recommendation and creative milestone lives permanently on ANCRID™ — from a first cohort meeting to a decade
          after graduation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p, i) => (
          <motion.div key={p.user_id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-interactive p-5 flex flex-col gap-3"
            data-testid={`alumni-card-${p.user_id}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/10">
                  {p.picture ? <img src={p.picture} alt={p.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full bg-gradient-cohesion" />}
                </div>
                <div>
                  <div className="text-white font-semibold flex items-center gap-1">
                    {p.name} {p.verified && <VerifiedBadge className="w-3.5 h-3.5" />}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {p.title || p.role?.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
              {p.is_alumni ? (
                <RoleChip tone="orange">Alumni · {p.alumni_class}</RoleChip>
              ) : (
                <RoleChip tone="blue">Network</RoleChip>
              )}
            </div>
            {p.alumni_role && (
              <div className="glass-interactive p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Now</div>
                <div className="text-white text-sm">{p.alumni_role} · {p.company}</div>
              </div>
            )}
            {p.bio && <div className="text-zinc-400 text-xs leading-relaxed line-clamp-3">{p.bio}</div>}
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-auto">
              {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>}
              {p.years_experience && <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {p.years_experience} yrs</span>}
            </div>
            <Link to={`/profile/${p.user_id}`}
              data-testid={`alumni-view-${p.user_id}`}
              className="btn-outline text-xs w-full text-center">View Full Profile</Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
