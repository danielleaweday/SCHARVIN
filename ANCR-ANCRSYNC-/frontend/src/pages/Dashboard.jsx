import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHeader, Section, Metric, TagPill } from "@/components/Bits";
import { useAuth } from "@/context/AuthContext";
import { ArrowUpRight, CalendarClock, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="p-16 text-white/40 font-mono">Loading dashboard…</div>;
  const r = data.readiness;

  return (
    <div data-testid="career-dashboard">
      <PageHeader
        eyebrow={`ANCRID · ${user?.role?.replace("_", " ") || ""}`}
        title={<>Welcome back,<br /><span className="grad-text">{user?.full_name?.split(" ")[0]}</span>.</>}
        subtitle="Your career center — assembled from verified data across the ANCR ecosystem."
        right={
          <Link
            to="/coach"
            data-testid="dashboard-cta-coach"
            className="hidden lg:inline-flex items-center gap-3 border hair-strong px-6 py-4 hover:bg-white/5 transition-colors font-mono text-[11px] uppercase tracking-[0.24em]"
          >
            <Sparkles strokeWidth={1.25} className="h-4 w-4" />
            Talk to AIAH™
          </Link>
        }
      />

      {/* Bento */}
      <Section className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
          {/* Readiness Hero */}
          <div className="md:col-span-8 lg:col-span-8 border hair p-8 md:p-12 relative overflow-hidden bg-[#050505]">
            <div className="label-eyebrow">Career Readiness™</div>
            <div className="mt-8 flex flex-col md:flex-row md:items-end gap-10">
              <ScoreRing value={r.overall} />
              <div className="flex-1">
                <div className="font-display text-3xl md:text-4xl leading-tight">
                  <span className="grad-text">{r.tier}</span>
                </div>
                <p className="text-white/60 mt-4 max-w-lg text-sm leading-relaxed">
                  Composite of ten weighted signals from ANCRID™, ANCRA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™, ANCRMEDIA™, and ANCRD™.
                </p>
                <Link
                  to="/readiness"
                  className="inline-flex items-center gap-2 mt-6 text-xs font-mono uppercase tracking-[0.24em] border-b hair-strong pb-1 hover:border-white transition-colors"
                >
                  Full breakdown <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>

          <Metric testid="metric-portfolio" label="Portfolio Completion" value={`${data.portfolio_completion}%`} sub="Assembled from ecosystem" />
          <Metric testid="metric-resume" label="Resume Status" value={`${data.resume.completion}%`} sub={data.resume.exists ? "Draft on file" : "Not yet started"} />
          <Metric testid="metric-reputation" label="Professional Reputation" value={data.professional_reputation.score ?? "—"} sub={`${data.professional_reputation.endorsements ?? 0} endorsements`} />
          <Metric testid="metric-publishing" label="Publishing" value={data.publishing_summary.works} sub={`${data.publishing_summary.releases} media releases`} />

          {/* Applications */}
          <div className="md:col-span-8 lg:col-span-8 border hair p-8 bg-[#050505]">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="label-eyebrow">Applications</div>
                <div className="font-mono text-4xl mt-3">{data.applications.total}</div>
              </div>
              <Link to="/applications" data-testid="link-applications" className="text-[11px] font-mono uppercase tracking-[0.24em] border-b hair-strong hover:border-white">
                View all
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {Object.entries(data.applications.by_stage).map(([k, v]) => (
                <div key={k} className="border hair px-4 py-3">
                  <div className="label-eyebrow text-[9px]">{k}</div>
                  <div className="font-mono text-xl mt-1">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 divide-y hair border-t hair">
              {data.applications.recent.map((a) => (
                <div key={a.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm">{a.opportunity_title}</div>
                    <div className="label-eyebrow text-[9px] mt-1">{a.employer}</div>
                  </div>
                  <TagPill>{a.stage}</TagPill>
                </div>
              ))}
              {data.applications.recent.length === 0 && <div className="py-6 text-white/40 text-sm">No applications yet.</div>}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="md:col-span-8 lg:col-span-4 border hair p-8 bg-[#050505]">
            <div className="flex items-center justify-between">
              <div className="label-eyebrow">Upcoming Interviews</div>
              <CalendarClock strokeWidth={1.25} className="h-4 w-4 text-white/50" />
            </div>
            <div className="mt-6 space-y-6">
              {data.upcoming_interviews.map((i) => (
                <div key={i.id} className="border-l-2 pl-4" style={{ borderColor: "#8a2be2" }}>
                  <div className="font-display text-xl">{i.role}</div>
                  <div className="label-eyebrow text-[9px] mt-1">{i.employer}</div>
                  <div className="font-mono text-xs mt-3 text-white/60">{new Date(i.when).toLocaleString()}</div>
                </div>
              ))}
              {data.upcoming_interviews.length === 0 && <div className="text-white/40 text-sm">No interviews scheduled.</div>}
            </div>
          </div>

          {/* Recommended */}
          <div className="col-span-full border hair p-8 bg-[#050505]">
            <div className="flex items-baseline justify-between mb-8">
              <div className="label-eyebrow">Recommended Opportunities</div>
              <Link to="/jobs" className="text-[11px] font-mono uppercase tracking-[0.24em] border-b hair-strong hover:border-white">Browse all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recommended_opportunities.map((o) => (
                <Link
                  key={o.id}
                  to={`/${o.kind === "job" ? "jobs" : o.kind === "internship" ? "internships" : o.kind === "audition" ? "auditions" : "projects"}`}
                  className="group border hair p-6 hover:border-white/25 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="label-eyebrow text-[9px]">{o.category}</div>
                  <div className="font-display text-2xl mt-3 leading-tight">{o.title}</div>
                  <div className="text-white/60 text-sm mt-2">{o.employer} · {o.location}</div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="font-mono text-[11px] text-white/50">{o.compensation || "—"}</div>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={1.25} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="col-span-full border hair p-8 bg-[#050505]">
            <div className="label-eyebrow mb-8">Career Timeline</div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px hair border-l" />
              <ul className="space-y-6">
                {data.career_timeline.map((e, idx) => (
                  <li key={idx} className="pl-12 relative">
                    <span
                      className="absolute left-3 top-2 h-2 w-2 rounded-full"
                      style={{ background: "linear-gradient(90deg,#00f0ff,#8a2be2,#ff00ff,#ffa500)" }}
                    />
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                      {e.date} · {e.kind}
                    </div>
                    <div className="mt-1 text-sm">{e.label}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function ScoreRing({ value }) {
  const size = 180;
  const r = 76;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="35%" stopColor="#8a2be2" />
            <stop offset="70%" stopColor="#ff00ff" />
            <stop offset="100%" stopColor="#ffa500" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-5xl tracking-tighter">{value}</div>
        <div className="label-eyebrow text-[9px] mt-1">of 100</div>
      </div>
    </div>
  );
}
