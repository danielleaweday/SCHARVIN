import React, { useEffect, useState } from "react";
import AppShell from "@/components/ancrd/AppShell";
import { api } from "@/lib/api";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, MapPin, Globe, Instagram, Award, Music2, Languages, GraduationCap, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ReputationRow } from "@/components/ancrd/ReputationBadge";
import CollaborationTimeline from "@/components/ancrd/CollaborationTimeline";

export default function ProfilePage() {
  const { id } = useParams();
  const [u, setU] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then(({data})=>setU(data));
  }, [id]);

  if (!u) return <AppShell><div className="font-mono text-xs text-white/40">Loading…</div></AppShell>;

  const passport = Math.min(100, (u.portfolio_score || 60));

  const follow = async () => {
    await api.post(`/users/${id}/follow`);
    toast.success(`Following ${u.name}`);
  };

  return (
    <AppShell>
      <div className="relative rounded-sm overflow-hidden border border-white/10" data-testid="profile-banner">
        <img src={u.banner} className="w-full h-64 object-cover opacity-70" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="mt-[-60px] relative z-10 px-6 flex flex-col md:flex-row md:items-end gap-6">
        <img src={u.avatar} className="h-32 w-32 rounded-sm object-cover border-4 border-[#050505]" alt="" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-5xl font-black tracking-tighter">{u.name}</h1>
            {u.verified && <CheckCircle2 className="h-5 w-5 text-[#00E5FF]" />}
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#00E5FF]">{u.verification_level}</span>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-white/50 mt-1">
            {u.role} · {u.institution} · {u.degree_program} · Class of {u.graduation_year}
          </div>
          <p className="mt-3 text-white/80 max-w-2xl">{u.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {u.disciplines?.map((d) => (
              <span key={d} className="px-2 py-1 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-wider text-white/70">{d}</span>
            ))}
          </div>
          {u.institution_id && (
            <div className="mt-3">
              <Link
                to={`/institutions/${u.institution_id}`}
                data-testid="profile-institution-link"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white btn-cine"
              >
                <Building2 className="h-3 w-3" style={{ color: "#F97316" }} /> View {u.institution} Campus →
              </Link>
            </div>
          )}
          {u.reputation?.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Reputation</div>
              <ReputationRow badges={u.reputation} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button data-testid="follow-btn" onClick={follow} className="px-4 py-2 bg-white text-black font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine hover:bg-[#00E5FF]">Follow</button>
          <button data-testid="message-btn" className="px-4 py-2 border border-white/15 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine hover:border-white/30">Message</button>
          <button data-testid="collaborate-btn" className="px-4 py-2 border border-white/15 font-mono text-[11px] uppercase tracking-widest rounded-sm btn-cine hover:border-[#00E5FF]/50 hover:text-[#00E5FF]">Collaborate</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-10">
        <div className="md:col-span-4 glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Creator Passport</div>
          <div className="font-display text-5xl font-black tracking-tighter">{passport}<span className="text-white/30 text-2xl">/100</span></div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#D4AF37]" style={{width: `${passport}%`}} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/70"><MapPin className="h-3.5 w-3.5 text-white/40" /> {u.location}</div>
            <div className="flex items-center gap-2 text-white/70"><Music2 className="h-3.5 w-3.5 text-white/40" /> {u.genre} · {u.instrument}</div>
            <div className="flex items-center gap-2 text-white/70"><Languages className="h-3.5 w-3.5 text-white/40" /> {u.languages?.join(", ")}</div>
            <div className="flex items-center gap-2 text-white/70"><GraduationCap className="h-3.5 w-3.5 text-white/40" /> {u.cohort}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
            <Stat n={u.followers?.length || 0} label="Followers" />
            <Stat n={u.following?.length || 0} label="Following" />
            <Stat n={u.availability} label="Available" small />
          </div>
        </div>

        <div className="md:col-span-8 glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Skills & Expertise</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {u.skills?.map((s) => (
              <span key={s} className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-sm text-sm">{s}</span>
            ))}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Achievements</div>
          <div className="space-y-2">
            {u.achievements?.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-[#D4AF37]" /> {a}</div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Ecosystem Activity</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              {["ANCRA","ANCRLAB","INHEIRA","COHEIR"].map(m=>(
                <div key={m} className="p-3 border border-white/10 rounded-sm">
                  <div className="font-display font-black text-2xl">{Math.floor(Math.random()*24)+3}</div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-white/40">{m}</div>
                </div>
              ))}
            </div>
          </div>
          {u.timeline?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">
                Collaboration Timeline
              </div>
              <CollaborationTimeline entries={u.timeline} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({n, label, small}) {
  return (
    <div>
      <div className={small ? "font-display font-bold text-sm" : "font-display font-black text-2xl"}>{n}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}
