import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import {
  ArrowLeft, TrendingUp, GraduationCap, Users2, Music2, Briefcase, Award, Target
} from "lucide-react";

export default function InstitutionDashboardPage() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  useEffect(() => { api.get(`/institutions/${id}/dashboard`).then(({data})=>setD(data)); }, [id]);
  if (!d) return <AppShell><div className="font-mono text-xs text-white/40">Loading dashboard…</div></AppShell>;

  const { institution, counts, career_readiness, placement_rate, graduation_by_year, collaborations, top_faculty, top_students } = d;
  const kpis = [
    { label: "Total Members", value: counts.total, icon: Users2, color: "#60A5FA" },
    { label: "Students", value: counts.students, icon: GraduationCap, color: "#00E5FF" },
    { label: "Faculty", value: counts.faculty, icon: Award, color: "#A855F7" },
    { label: "Alumni", value: counts.alumni, icon: TrendingUp, color: "#D4AF37" },
    { label: "Releases", value: counts.releases, icon: Music2, color: "#EC4899" },
    { label: "Collaborations", value: collaborations.total, icon: Users2, color: "#14b8a6" },
    { label: "Posts", value: counts.posts, icon: Target, color: "#F97316" },
    { label: "Faculty Posts", value: counts.faculty_posts, icon: Briefcase, color: "#ffffff" },
  ];

  return (
    <AppShell>
      <div className="mb-4">
        <Link to={`/institutions/${id}`} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white btn-cine">
          <ArrowLeft className="h-3 w-3" /> Back to {institution.name}
        </Link>
      </div>

      <PageHeader
        section="Institution Dashboard"
        kicker={institution.name}
        description="Live analytics across engagement, career readiness, placement, and faculty activity."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => (
          <div key={k.label} data-testid={`kpi-${k.label.toLowerCase().replace(/\s+/g,'-')}`} className="glass rounded-sm p-5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{k.label}</div>
              <k.icon className="h-3.5 w-3.5" style={{ color: k.color }} />
            </div>
            <div className="font-display font-black text-4xl tracking-tighter mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        <div className="lg:col-span-4 glass rounded-sm p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Career Readiness</div>
          <div className="font-display font-black text-6xl tracking-tighter">
            {career_readiness}<span className="text-white/30 text-2xl">/100</span>
          </div>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${career_readiness}%`,
                background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)",
              }}
            />
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Avg portfolio score across {counts.total} members
          </div>
        </div>

        <div className="lg:col-span-4 glass rounded-sm p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Placement Rate</div>
          <div className="font-display font-black text-6xl tracking-tighter">{placement_rate}<span className="text-white/30 text-2xl">%</span></div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Alumni with portfolio ≥ 70
          </div>
        </div>

        <div className="lg:col-span-4 glass rounded-sm p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Graduation by Year</div>
          <div className="flex items-end gap-2 h-32">
            {graduation_by_year.length === 0 && (
              <div className="text-white/40 text-sm">No data</div>
            )}
            {graduation_by_year.map(([y, c]) => {
              const max = Math.max(...graduation_by_year.map(([_, cc]) => cc));
              const h = Math.max(10, (c / max) * 100);
              return (
                <div key={y} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm" style={{
                    height: `${h}%`,
                    background: "linear-gradient(180deg, rgba(236,72,153,0.6), rgba(249,115,22,0.4))",
                  }} />
                  <div className="font-mono text-[9px] text-white/50">{y}</div>
                  <div className="font-display font-black text-xs">{c}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Top Faculty by Portfolio</div>
          <div className="space-y-2">
            {top_faculty.map((u, i) => (
              <RankRow key={u.id} u={u} rank={i + 1} />
            ))}
            {top_faculty.length === 0 && <div className="text-white/40 text-sm">No faculty yet.</div>}
          </div>
        </div>
        <div className="glass rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Top Students by Portfolio</div>
          <div className="space-y-2">
            {top_students.map((u, i) => (
              <RankRow key={u.id} u={u} rank={i + 1} />
            ))}
            {top_students.length === 0 && <div className="text-white/40 text-sm">No students yet.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RankRow({ u, rank }) {
  return (
    <Link to={`/profile/${u.id}`} className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-sm hover:bg-white/[0.03] btn-cine">
      <div className="font-display font-black text-lg w-6 text-white/40">{rank}</div>
      <img src={u.avatar} className="h-8 w-8 rounded-sm object-cover" alt="" />
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm truncate">{u.name}</div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 truncate">{u.role}</div>
      </div>
      <div className="font-display font-black text-sm" style={{ color: "#F97316" }}>{u.portfolio_score}</div>
    </Link>
  );
}
