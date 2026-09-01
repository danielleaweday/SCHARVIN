import React from "react";
import AppShell from "@/components/ancrd/AppShell";
import { Link } from "react-router-dom";

export default function EcosystemModulePage({ module }) {
  const info = MODULES[module] || { name: module, tagline: "Coming to ANCRD soon." };
  return (
    <AppShell>
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Ecosystem Module</div>
        <h1 className="font-display text-6xl font-black tracking-tighter mt-1">
          {info.name}<span className="text-[#00E5FF] text-lg align-super">™</span>
        </h1>
        <div className="text-white/60 mt-2 max-w-2xl">{info.tagline}</div>
      </div>
      <div className="glass rounded-sm p-8 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1709625862266-014ef072fd93?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#00E5FF] mb-2">Connected to ANCRD</div>
          <div className="font-display text-3xl font-black tracking-tighter max-w-2xl">
            Activity from {info.name} surfaces automatically inside your ANCRD profile and feed.
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {info.streams.map((s) => (
              <div key={s} className="p-3 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest text-white/70">{s}</div>
            ))}
          </div>
          <Link to="/feed" className="inline-block mt-8 px-4 py-2 bg-white text-black font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine hover:bg-[#00E5FF]">
            ← Back to ANCRD
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

const MODULES = {
  ancra:    { name: "ANCRA",     tagline: "The academic core. Courses, certifications, assignments, achievements.", streams: ["Completed Courses", "Certificates", "Assignments", "Achievements"] },
  ancrlab:  { name: "ANCRLAB",   tagline: "Studio & production. New projects, studio sessions, creative milestones.", streams: ["Projects", "Sessions", "Milestones", "Updates"] },
  ancrsync: { name: "ANCRSync",  tagline: "Writing rooms, collaborations, session workspaces.", streams: ["Writing Rooms", "Collabs", "Sessions", "Workspaces"] },
  coheir:   { name: "COHEIR",    tagline: "Mentorship, office hours, industry reviews.", streams: ["Mentor Feedback", "Office Hours", "Recommendations", "Reviews"] },
  inheira:  { name: "INHEIRA",   tagline: "Publishing, splits, catalogs.", streams: ["Song Registrations", "Splits", "Catalog", "Release Readiness"] },
  vaulta:   { name: "Vaulta",    tagline: "Grants, funding, business milestones.", streams: ["Grants", "Funding", "Awards", "Milestones"] },
  ancrmedia:{ name: "ANCRMEDIA", tagline: "Music, video, live streams, podcasts, charts.", streams: ["Music", "Video", "Live", "Charts"] },
  ancrlaunch:{ name: "ANCRLaunch", tagline: "Careers, internships, employer activity.", streams: ["Internships", "Employment", "Placements", "Hiring"] },
  ancrid:   { name: "ANCRID",    tagline: "Identity, verification, permissions.", streams: ["Identity", "Verification", "Permissions", "Credentials"] },
};
