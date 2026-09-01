import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { BadgeCheck, TrendingUp, Users, GraduationCap, Sparkles, Award, Briefcase, Building2 } from "lucide-react";

const PALETTE = ["#00F0FF", "#8B5CF6", "#F97316", "#22D3EE", "#A78BFA", "#FB923C", "#4ADE80", "#F472B6"];

const tooltipStyle = {
  contentStyle: { background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 },
  labelStyle: { color: "#a1a1aa", fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" },
};

function Chart({ title, kicker, icon: Icon, children, className = "" }) {
  return (
    <div className={`glass-panel p-6 ${className}`} data-testid={`analytics-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-[#00F0FF]" />}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{kicker}</div>
          <div className="wordmark text-xl text-white leading-tight">{title}</div>
        </div>
      </div>
      <div className="h-64 min-h-[256px] w-full">{children}</div>
    </div>
  );
}

export default function Analytics() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/analytics/institution").then(({ data }) => setD(data)); }, []);
  if (!d) return <div className="text-zinc-500 font-mono text-xs">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
          <BadgeCheck className="w-3.5 h-3.5 text-[#00F0FF]" /> Institution Intelligence
        </div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">CCDP Program Health.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          Live signals across mentorship, creative output, career readiness, placement and alumni engagement — the operating dashboard for the CCDP.
        </p>
      </header>

      {/* Totals strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Students", v: d.totals.students, i: GraduationCap },
          { l: "Professionals", v: d.totals.professionals, i: Users },
          { l: "Cohorts", v: d.totals.cohorts, i: Building2 },
          { l: "Sessions", v: d.totals.sessions, i: Sparkles },
          { l: "Reviews", v: d.totals.reviews, i: BadgeCheck },
          { l: "Recommendations", v: d.totals.recommendations, i: Award },
          { l: "Opportunities", v: d.totals.opportunities, i: Briefcase },
          { l: "Portfolio Files", v: d.totals.portfolio_files, i: TrendingUp },
        ].map((s) => (
          <div key={s.l} className="glass-panel p-4">
            <s.i className="w-4 h-4 text-[#00F0FF] mb-2" />
            <div className="wordmark text-2xl text-white">{s.v}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.l}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Mentor Engagement */}
        <Chart title="Mentor Engagement" kicker="reviews + recs + sessions hosted" icon={Users}>
          <ResponsiveContainer>
            <BarChart data={d.mentor_engagement} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} width={130} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="score" fill="#00F0FF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 2. Student Engagement */}
        <Chart title="Student Engagement" kicker="uploads + sessions + mentors" icon={GraduationCap}>
          <ResponsiveContainer>
            <BarChart data={d.student_engagement}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={9} angle={-20} textAnchor="end" height={60} interval={0} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="score" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 3. Creative Output */}
        <Chart title="Creative Output" kicker="by discipline" icon={Sparkles}>
          <ResponsiveContainer>
            <BarChart data={d.creative_output}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="discipline" stroke="#71717a" fontSize={9} angle={-15} textAnchor="end" height={60} interval={0} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="files" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 4. Portfolio Completion */}
        <Chart title="Portfolio Completion" kicker="% students with ≥ 3 files" icon={TrendingUp}>
          <ResponsiveContainer>
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" barSize={16}
              data={[
                { name: "Completed", v: d.portfolio_completion.completion_rate, fill: "#00F0FF" },
                { name: "In progress", v: 100 - d.portfolio_completion.completion_rate, fill: "#8B5CF6" },
              ]}>
              <RadialBar background dataKey="v" cornerRadius={8} />
              <Tooltip {...tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ color: "#a1a1aa", fontFamily: "JetBrains Mono", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 5. Industry Participation */}
        <Chart title="Industry Participation" kicker="sessions hosted by role" icon={Users}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={d.industry_participation} dataKey="sessions" nameKey="role" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {d.industry_participation.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
            </PieChart>
          </ResponsiveContainer>
        </Chart>

        {/* 6. Session Attendance */}
        <Chart title="Session Attendance" kicker="attendees by kind" icon={Sparkles}>
          <ResponsiveContainer>
            <BarChart data={d.session_attendance}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="kind" stroke="#71717a" fontSize={9} angle={-15} textAnchor="end" height={60} interval={0} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="attendees" fill="#22D3EE" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sessions" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 7. Review Activity */}
        <Chart title="Review Activity" kicker="reviews per week" icon={BadgeCheck}>
          <ResponsiveContainer>
            <AreaChart data={d.review_activity}>
              <defs>
                <linearGradient id="grad-review" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="reviews" stroke="#00F0FF" strokeWidth={2} fill="url(#grad-review)" />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>

        {/* 8. Career Readiness */}
        <Chart title="Career Readiness" kicker="distribution" icon={TrendingUp}>
          <ResponsiveContainer>
            <BarChart data={d.career_readiness}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="band" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {d.career_readiness.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 9. Graduation Readiness */}
        <Chart title="Graduation Readiness" kicker="students by class year" icon={GraduationCap}>
          <ResponsiveContainer>
            <BarChart data={d.graduation_readiness}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="students" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 10. Placement */}
        <Chart title="Placement" kicker="recommendations by target org" icon={Award}>
          <ResponsiveContainer>
            <BarChart data={d.placement} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={10} allowDecimals={false} />
              <YAxis dataKey="target" type="category" stroke="#a1a1aa" fontSize={11} width={160} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 11. Employer Activity */}
        <Chart title="Employer Activity" kicker="opportunities & applicants" icon={Briefcase}>
          <ResponsiveContainer>
            <BarChart data={d.employer_activity}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="company" stroke="#71717a" fontSize={9} angle={-15} textAnchor="end" height={70} interval={0} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="opportunities" fill="#00F0FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="applicants" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        {/* 12. Alumni Engagement */}
        <Chart title="Alumni Engagement" kicker="lifetime relationship touchpoints" icon={Users}>
          <ResponsiveContainer>
            <LineChart data={d.alumni_engagement.monthly_touchpoints}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="touches" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
      </div>

      <div className="glass-panel p-6">
        <div className="wordmark text-lg text-white mb-2">Lifelong Network Principle</div>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
          Every relationship established during CCDP continues into a creator's professional career through ANCRID™.
          Faculty, mentors, employers, executives, collaborators and alumni remain connected across the entire arc of a
          creator's life — with COHEIR™ as the professional relationship layer of the ANCR ecosystem.
        </p>
      </div>
    </div>
  );
}
