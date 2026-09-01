import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, StatCell, Chip } from "@/components/common/Primitives";
import { ArrowUpRight, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

export default function CommandCenter() {
  const { data } = useSWR("/faculty/dashboard", get);
  if (!data) return <div className="p-10 font-mono text-[12px] text-ancr-mute">Loading command center…</div>;
  const { faculty, cohorts, reviews_pending, sessions_upcoming, approvals, stats } = data;

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      {/* header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="ancr-label mb-2">Command Center · {faculty.title}</div>
          <h1 className="font-serif text-5xl leading-none tracking-tight">
            {faculty.name.replace(/^Prof\.\s+/, "").split(" ")[0]},<br />
            <span className="italic text-ancr-dim">your studio · {new Date().toLocaleDateString("en-US", { weekday: "long" })}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/faculty/curriculum" data-testid="link-curriculum" className="ancr-btn ancr-btn-ghost">Curriculum Builder</Link>
          <Link to="/faculty/analytics" className="ancr-btn ancr-btn-primary">View analytics</Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-6">
        <StatCell label="Students" value={stats.total_students} hint="active this semester" />
        <StatCell label="Active Reviews" value={stats.active_reviews} hint="awaiting your input" accent />
        <StatCell label="Cohorts" value={stats.cohorts} />
        <StatCell label="Avg Portfolio" value={stats.avg_portfolio_score} hint="+3 vs Sept" />
        <StatCell label="Grad-Ready" value={stats.graduation_ready} />
        <StatCell label="At-Risk" value={stats.at_risk} hint="intervention" />
      </div>

      {/* Two columns */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Approvals */}
        <div className="lg:col-span-7">
          <div className="ancr-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <div className="ancr-label">Approvals · pending</div>
                <div className="mt-1 font-serif text-2xl">{approvals.length} items waiting</div>
              </div>
              <Link to="/faculty/approvals" className="font-mono text-[10px] uppercase tracking-wider text-ancr-dim hover:text-white flex items-center gap-1">
                Open queue <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {approvals.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02]">
                  <img src={r.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-[15px]">{r.student}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-ancr-dim">{r.kind} · {r.experience}</div>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${
                    r.priority === "high" ? "text-[var(--ancra-accent)]" :
                    r.priority === "medium" ? "text-amber-300" : "text-ancr-dim"
                  }`}>{r.priority}</span>
                  <div className="font-mono text-[10px] text-ancr-mute w-16 text-right">{r.submitted}</div>
                  <button data-testid={`approve-${r.id}`} className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights + Sessions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ · Insight</div>
            </div>
            <div className="mt-3 font-serif text-xl leading-snug">
              3 students in Cohort 07 are stuck at "demo" for 4+ weeks. Two share a co-writer (Ava Reyes). Suggest scheduling a group writing room?
            </div>
            <div className="mt-4 flex gap-2">
              <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Schedule</button>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Dismiss</button>
            </div>
          </div>

          <div className="ancr-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <div className="ancr-label">Sessions today · Cohort 07</div>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {sessions_upcoming.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                  <CheckCircle2 size={14} className="text-ancr-dim flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] truncate">{s.title}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-ancr-mute">{s.when} · {s.guest}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cohorts */}
      <div className="mt-14">
        <Section eyebrow="Cohorts" title="Live health" right={<Link to="/faculty/cohorts" className="ancr-btn ancr-btn-ghost">Manage cohorts</Link>} />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cohorts.map((c) => (
            <div key={c.id} className="ancr-card p-6">
              <div className="ancr-label">{c.students} students</div>
              <div className="mt-2 font-serif text-xl leading-tight">{c.name}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] text-ancr-dim uppercase tracking-wider">
                <div><div className="text-white text-lg font-serif">{c.avg_score}</div>Avg</div>
                <div><div className="text-emerald-300 text-lg font-serif">{c.graduation_ready}</div>Ready</div>
                <div className="text-[var(--ancra-accent)]"><div className="text-lg font-serif">{c.at_risk}</div>At-risk</div>
              </div>
              {c.concentration_mix && (
                <div className="mt-4 font-mono text-[10px] text-ancr-mute">{c.concentration_mix}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
