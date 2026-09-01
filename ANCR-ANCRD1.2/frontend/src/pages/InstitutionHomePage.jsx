import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api, timeAgo } from "@/lib/api";
import {
  MapPin, GraduationCap, Users2, Award, Music2, Calendar, Briefcase,
  ArrowLeft, LineChart, Building2, Trophy, ArrowRight, CheckCircle2
} from "lucide-react";
import { ReputationRow } from "@/components/ancrd/ReputationBadge";

export default function InstitutionHomePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/institutions/${id}`).then(({ data }) => setData(data));
  }, [id]);

  if (!data) return <AppShell><div className="font-mono text-xs text-white/40">Loading campus…</div></AppShell>;

  const { institution, counts, students, faculty, alumni, feed, releases, events, opportunities, leaderboard, departments } = data;
  const bannerImg = "https://images.unsplash.com/photo-1770062421988-7929b4748e29?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85";

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/institutions" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white btn-cine">
          <ArrowLeft className="h-3 w-3" /> All Institutions
        </Link>
      </div>

      <PageHeader
        section="Institution"
        kicker={`${institution.city}, ${institution.country}`}
        right={
          <Link
            to={`/institutions/${id}/dashboard`}
            data-testid="link-institution-dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 hover:border-[#F97316]/60 hover:text-[#F97316] btn-cine rounded-sm font-mono text-[11px] uppercase tracking-widest"
          >
            <LineChart className="h-3.5 w-3.5" /> Institution Dashboard
          </Link>
        }
      />

      <div className="relative rounded-sm overflow-hidden border border-white/10 mb-8" data-testid="inst-banner">
        <img src={bannerImg} className="w-full h-64 object-cover opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#F97316" }}>
            <Building2 className="h-3 w-3" /> CCDP Partner Institution
          </div>
          <div className="font-display font-black text-5xl tracking-tighter mt-1">{institution.name}</div>
          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/60">
            <MapPin className="h-3 w-3" /> {institution.city}, {institution.country}
          </div>
        </div>
      </div>

      {/* Counts strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <CountCard label="Students" value={counts.students} />
        <CountCard label="Faculty" value={counts.faculty} />
        <CountCard label="Alumni" value={counts.alumni} />
        <CountCard label="Releases" value={counts.releases} />
        <CountCard label="Events" value={counts.events} />
        <CountCard label="Posts" value={counts.posts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: About + Institution Feed */}
        <div className="lg:col-span-8 space-y-6">
          <section className="glass rounded-sm p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">About</div>
            <p className="mt-2 text-white/80 leading-relaxed">
              {institution.name} is a verified CCDP partner institution in {institution.city}, {institution.country}.
              Every student, faculty member, and alum listed on this page is authenticated through ANCRID
              and active across the ANCR Ecosystem.
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-black text-2xl tracking-tighter">Institution Feed</div>
              <Link to="/feed" className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white">
                All signals →
              </Link>
            </div>
            {feed.slice(0, 6).map((p) => (
              <div key={p.id} data-testid={`inst-feed-${p.id}`} className="glass rounded-sm p-4 mb-3">
                <div className="flex items-center gap-3">
                  <img src={p.author?.avatar} className="h-9 w-9 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm">{p.author?.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{p.author?.role} · {timeAgo(p.created_at)}</div>
                  </div>
                </div>
                <div className="text-sm text-white/85 mt-3">{p.content}</div>
                {p.hashtags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.hashtags.map((h) => (
                      <span key={h} className="font-mono text-[10px]" style={{ color: "#F97316" }}>{h}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {feed.length === 0 && (
              <div className="glass rounded-sm p-6 text-center text-white/60 text-sm">
                Feed is quiet. Students and faculty will populate this soon.
              </div>
            )}
          </section>

          {releases.length > 0 && (
            <section>
              <div className="font-display font-black text-2xl tracking-tighter mb-3">Releases & Achievements</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {releases.slice(0, 6).map((r) => (
                  <div key={r.id} className="glass rounded-sm p-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "#EC4899" }}>
                      <Music2 className="h-3 w-3" /> {r.kind}
                    </div>
                    <div className="mt-1 text-sm text-white/85">{r.content}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <img src={r.author?.avatar} className="h-6 w-6 rounded-sm object-cover" alt="" />
                      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                        {r.author?.name} · {timeAgo(r.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section>
              <div className="font-display font-black text-2xl tracking-tighter mb-3">Institution Events</div>
              <div className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <div key={e.id} className="glass rounded-sm p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-sm border border-[#F97316]/40 flex items-center justify-center" style={{ background: "rgba(249,115,22,0.10)" }}>
                      <Calendar className="h-4 w-4" style={{ color: "#F97316" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm">{e.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                        {new Date(e.date).toLocaleDateString()} · {e.location}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                      {e.attendees?.length || 0} attending
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <div className="lg:col-span-4 space-y-4">
          <section className="glass rounded-sm p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
              <Trophy className="h-3 w-3" style={{ color: "#D4AF37" }} /> Leaderboard
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 6).map((u, i) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.id}`}
                  data-testid={`inst-leader-${u.id}`}
                  className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-sm hover:bg-white/[0.03] btn-cine"
                >
                  <div className="font-display font-black text-lg w-6 text-white/40">{i + 1}</div>
                  <img src={u.avatar} className="h-8 w-8 rounded-sm object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm truncate">{u.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 truncate">{u.role}</div>
                  </div>
                  <div className="font-display font-black text-sm" style={{ color: "#F97316" }}>{u.portfolio_score}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="glass rounded-sm p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Departments & Programs</div>
            <div className="flex flex-wrap gap-1.5">
              {departments.map((p) => (
                <span key={p} className="px-2 py-1 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest text-white/70">
                  {p}
                </span>
              ))}
            </div>
          </section>

          <MembersCard title="Faculty" users={faculty} accent="#A855F7" />
          <MembersCard title="Students" users={students} accent="#00E5FF" />
          {alumni.length > 0 && <MembersCard title="Alumni" users={alumni} accent="#D4AF37" />}

          {opportunities.length > 0 && (
            <section className="glass rounded-sm p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
                <Briefcase className="h-3 w-3" style={{ color: "#EC4899" }} /> Recent Opportunities
              </div>
              <div className="space-y-2">
                {opportunities.slice(0, 4).map((o) => (
                  <Link key={o.id} to="/opportunities" className="block p-2 -mx-2 rounded-sm hover:bg-white/[0.03] btn-cine">
                    <div className="font-display font-bold text-sm">{o.title}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{o.kind} · {o.company}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CountCard({ label, value }) {
  return (
    <div className="glass rounded-sm p-4">
      <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="font-display font-black text-3xl tracking-tighter mt-0.5">{value}</div>
    </div>
  );
}

function MembersCard({ title, users, accent }) {
  return (
    <section className="glass rounded-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
          {title}
        </div>
        <div className="font-mono text-[10px] text-white/40">{users.length}</div>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {users.slice(0, 12).map((u) => (
          <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3 p-1 -mx-1 rounded-sm hover:bg-white/[0.03] btn-cine">
            <img src={u.avatar} className="h-8 w-8 rounded-sm object-cover" alt="" />
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-sm truncate">{u.name}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 truncate">{u.role}</div>
            </div>
            {u.verified && <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: accent }} />}
          </Link>
        ))}
      </div>
    </section>
  );
}
