import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Globe2, Award, Briefcase, Music2, PlayCircle, Sparkles,
  MessageSquare, CalendarPlus, LinkIcon, GraduationCap, ChevronRight,
  Fingerprint, Users, Wand2, Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const COVER = "https://images.pexels.com/photos/10933688/pexels-photo-10933688.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function ProfessionalProfile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [p, setP] = useState(null);

  useEffect(() => {
    api.get(`/professionals/${userId}`).then(({ data }) => setP(data)).catch(() => {
      // maybe student
      api.get(`/students/${userId}`).then(({ data }) => setP(data));
    });
  }, [userId]);

  if (!p) return <div className="text-zinc-500 font-mono text-xs">Loading profile…</div>;

  const isStudent = p.role === "student";

  return (
    <div className="-mx-8 -my-8">
      {/* HERO */}
      <div className="relative h-[380px] w-full overflow-hidden">
        <img src={COVER} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="absolute -top-10 -left-10 w-96 h-96 rounded-full bg-[#00F0FF]/25 blur-3xl" />
        <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-[#F97316]/20 blur-3xl" />
      </div>

      {/* Profile header */}
      <div className="relative -mt-40 px-8 pb-8">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
            <div className="relative">
              <div className="w-44 h-44 rounded-3xl overflow-hidden ring-2 ring-white/10 shadow-2xl">
                {p.picture ? <img src={p.picture} alt={p.name} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full bg-gradient-cohesion" />}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-black border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xl">
                <VerifiedBadge />
                <span className="font-mono text-[10px] uppercase tracking-widest text-white">Verified</span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="flex items-center gap-2 mb-3">
                <RoleChip tone="blue">{p.role?.replace(/_/g, " ")}</RoleChip>
                {p.company && <RoleChip tone="zinc">{p.company}</RoleChip>}
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                  <Fingerprint className="w-3 h-3" /> {p.ancrid}
                </div>
              </div>
              <h1 className="wordmark text-5xl md:text-6xl leading-none tracking-tighter">{p.name}</h1>
              {p.title && <div className="text-zinc-300 text-lg mt-2">{p.title}</div>}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-zinc-500 text-sm">
                {p.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {p.location}</div>}
                {p.years_experience && <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {p.years_experience} yrs</div>}
                {p.languages?.length > 0 && <div className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5" /> {p.languages.join(" · ")}</div>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {!isStudent && (
                  <button
                    data-testid="profile-request-mentorship-btn"
                    onClick={() => toast.success("Mentorship request sent — routed to " + p.name.split(" ")[0])}
                    className="btn-primary text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Request Mentorship
                  </button>
                )}
                <button
                  data-testid="profile-message-btn"
                  onClick={() => toast.success("Opening direct message…")}
                  className="btn-outline text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button
                  data-testid="profile-book-session-btn"
                  onClick={() => toast.success("Booking flow (session, office hours or portfolio review)")}
                  className="btn-outline text-sm flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4" /> Book a Session
                </button>
                <button
                  data-testid="profile-share-btn"
                  onClick={async () => {
                    try {
                      const { data } = await api.post("/share/kits", {
                        subject_user_id: p.user_id,
                        kind: isStudent ? "student_profile" : "press_kit",
                        expires_days: 90,
                      });
                      const link = `${window.location.origin}/p/${data.slug}`;
                      await navigator.clipboard?.writeText(link).catch(() => {});
                      toast.success("Public share link created & copied — expires in 90 days");
                    } catch (e) {
                      toast.error(e?.response?.data?.detail || "Only the profile owner or admin can create a share kit");
                    }
                  }}
                  className="btn-outline text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Profile
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right — Availability card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-panel p-5 w-full lg:w-[300px] flex-shrink-0">
            <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-2">Availability</div>
            <div className="text-white text-sm leading-relaxed">
              {p.availability || (isStudent ? "Actively seeking mentorship" : "Availability shared with cohort")}
            </div>
            {p.mentorship_philosophy && (
              <>
                <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mt-5 mb-2">Mentorship Philosophy</div>
                <blockquote className="text-zinc-300 text-sm leading-relaxed border-l-2 border-[#00F0FF]/50 pl-3 italic">
                  {p.mentorship_philosophy}
                </blockquote>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Body — bento */}
      <div className="max-w-[1400px] mx-auto px-8 pb-16 grid grid-cols-12 gap-4">
        {/* Bio + Disciplines */}
        {p.bio && (
          <div className="glass-panel p-6 col-span-12 lg:col-span-8">
            <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-3">Biography</div>
            <div className="text-zinc-300 leading-relaxed text-[15px]">{p.bio}</div>
          </div>
        )}

        <div className="glass-panel p-6 col-span-12 lg:col-span-4">
          <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-3">
            {isStudent ? "Skills" : "Disciplines & Expertise"}
          </div>
          <div className="flex flex-wrap gap-2">
            {(isStudent ? p.skills : [...(p.disciplines || []), ...(p.expertise || [])]).map((d) => (
              <RoleChip key={d} tone="violet">{d}</RoleChip>
            ))}
          </div>
          {p.industries?.length > 0 && (
            <>
              <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mt-6 mb-3">Industries Served</div>
              <div className="flex flex-wrap gap-2">
                {p.industries.map((i) => <RoleChip key={i} tone="zinc">{i}</RoleChip>)}
              </div>
            </>
          )}
          {p.teaching_interests?.length > 0 && (
            <>
              <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mt-6 mb-3">Teaching Interests</div>
              <div className="flex flex-wrap gap-2">
                {p.teaching_interests.map((i) => <RoleChip key={i} tone="orange">{i}</RoleChip>)}
              </div>
            </>
          )}
        </div>

        {/* Credits (professionals) */}
        {p.credits?.length > 0 && (
          <div className="glass-panel p-6 col-span-12 lg:col-span-8">
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="w-4 h-4 text-[#00F0FF]" />
              <div className="wordmark text-xl text-white">Selected Credits</div>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {p.credits.map((c, i) => (
                <div key={i} className="py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.05] grid place-items-center">
                    <PlayCircle className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold">{c.title} <span className="text-zinc-500">— {c.artist}</span></div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{c.role}{c.label && ` · ${c.label}`}</div>
                  </div>
                  <div className="text-zinc-400 text-sm font-mono">{c.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {p.awards?.length > 0 && (
          <div className="glass-panel p-6 col-span-12 lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#F97316]" />
              <div className="wordmark text-xl text-white">Awards</div>
            </div>
            <ul className="space-y-2">
              {p.awards.map((a) => (
                <li key={a} className="text-zinc-300 text-sm flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#00F0FF] flex-shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
            {p.certifications?.length > 0 && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-6 mb-2">Certifications</div>
                <ul className="space-y-1">
                  {p.certifications.map((c) => (
                    <li key={c} className="text-zinc-400 text-sm">· {c}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Career history */}
        {p.career_history?.length > 0 && (
          <div className="glass-panel p-6 col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#00F0FF]" />
              <div className="wordmark text-xl text-white">Career History</div>
            </div>
            <div className="space-y-4">
              {p.career_history.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-2" />
                  <div>
                    <div className="text-white font-semibold">{h.role}</div>
                    <div className="text-zinc-400 text-sm">{h.company}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{h.years}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current projects */}
        {p.current_projects?.length > 0 && (
          <div className="glass-panel p-6 col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-4 h-4 text-[#8B5CF6]" />
              <div className="wordmark text-xl text-white">Current Projects</div>
            </div>
            <div className="space-y-3">
              {p.current_projects.map((cp, i) => (
                <div key={i} className="glass-interactive p-4">
                  <div className="text-white font-semibold">{cp.title}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                    {cp.role} · {cp.status}
                  </div>
                  {cp.collaborators?.length > 0 && (
                    <div className="text-zinc-500 text-xs mt-2">with {cp.collaborators.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student-specific: goals, achievements, career readiness */}
        {isStudent && (
          <>
            <div className="glass-panel p-6 col-span-12 lg:col-span-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-[#00F0FF]" />
                <div className="wordmark text-xl text-white">Career Readiness</div>
              </div>
              <div className="wordmark text-6xl text-white">
                {p.career_readiness || 0}<span className="text-zinc-500 text-2xl">/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] mt-4 overflow-hidden">
                <div className="h-full bg-gradient-cohesion" style={{ width: `${p.career_readiness || 0}%` }} />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-3">
                Signals from ANCRID™, ANCRLAB™, ANCRSync™ & INHEIRA™
              </div>
            </div>
            {p.goals?.length > 0 && (
              <div className="glass-panel p-6 col-span-12 lg:col-span-6">
                <div className="wordmark text-xl text-white mb-3">Goals</div>
                <ul className="space-y-2">
                  {p.goals.map((g) => (
                    <li key={g} className="text-zinc-300 text-sm flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#F97316] mt-0.5" /> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Links */}
        {(p.portfolio_links?.length > 0 || p.professional_links?.length > 0) && (
          <div className="glass-panel p-6 col-span-12">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-4 h-4 text-[#00F0FF]" />
              <div className="wordmark text-xl text-white">Portfolio & Links</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...(p.portfolio_links || []), ...(p.professional_links || [])].map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer"
                  className="glass-interactive px-4 py-2 text-sm text-white flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-[#00F0FF]" /> {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Ecosystem strip */}
        <div className="glass-panel p-6 col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#8B5CF6]" />
            <div className="wordmark text-xl text-white">Ecosystem Presence</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {["ANCRID™", "ANCRLAB™", "ANCRSync™", "INHEIRA™", "Vaulta™", "ANCRLaunch™"].map((n) => (
              <div key={n} className="border border-white/[0.06] rounded-xl bg-white/[0.02] p-3 text-center">
                <div className="wordmark text-white text-sm">{n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#00F0FF] mt-1">Verified</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
