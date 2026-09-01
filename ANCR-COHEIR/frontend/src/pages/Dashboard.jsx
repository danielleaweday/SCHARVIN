import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Users, Globe2, Handshake, Award, Sparkles, BadgeCheck,
  CalendarDays, Briefcase, MessageSquare, PlayCircle, Rocket, Music2,
  FlaskConical, Lightbulb, Compass, Fingerprint,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MentorCard, RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import AncrBadge from "@/components/coheir/AncrBadge";

const HERO_IMAGE = "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [insight, setInsight] = useState(null);
  const [insightBusy, setInsightBusy] = useState(false);

  useEffect(() => {
    api.get("/dashboard/overview").then(({ data }) => setOverview(data));
    api.get("/professionals/featured?limit=6").then(({ data }) => setFeatured(data));
  }, []);

  const runAIAH = async () => {
    setInsightBusy(true);
    try {
      const kind = user.role === "student" ? "career_readiness" : "portfolio_gap";
      const prompt = user.role === "student"
        ? `Provide a Career Readiness snapshot for ${user.name}, a CCDP ${user.program || "creative"} student. Highlight strengths, gaps, and 3–5 action items connecting to ANCRLAB™, ANCRSync™, and INHEIRA™.`
        : `As ${user.name} (${user.title || user.role}), give me a portfolio gap analysis across my currently supervised students. Reference ANCRLAB™ and ANCRID™.`;
      const { data } = await api.post("/aiah/generate", { kind, prompt, context: "dashboard" });
      setInsight(data.output);
    } finally { setInsightBusy(false); }
  };

  if (!overview) {
    return <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Loading COHEIR…</div>;
  }

  const stats = overview.stats;
  const isStudent = user?.role === "student";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="lg:col-span-2 relative overflow-hidden glass-panel">
          <div className="absolute inset-0">
            <img src={HERO_IMAGE} alt="COHEIR" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/70 to-transparent" />
          </div>
          <div className="relative p-10">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-400 mb-4 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-2">
                <BadgeCheck className="w-3.5 h-3.5 text-[#00F0FF] verified-dot" />
                The Industry Leadership Network
              </span>
              <AncrBadge variant="pill" />
            </div>
            <h1 className="wordmark text-5xl md:text-6xl leading-[0.9] tracking-tighter">
              Welcome, <br /><span className="text-gradient-cohesion">{user.name.split(" ")[0]}.</span>
            </h1>
            <p className="text-zinc-400 mt-4 max-w-lg text-sm leading-relaxed">
              {isStudent
                ? "Your supervised professionals, live sessions, opportunities and ANCRID™ credentials — all in one operating system."
                : "Your supervised students, cohort supervision queue, portfolio reviews and industry sessions — all in one operating system."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate("/directory")} className="btn-primary text-sm flex items-center gap-2" data-testid="dashboard-find-mentor-btn">
                {isStudent ? "Find a Mentor" : "Discover Talent"} <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/sessions")} className="btn-outline text-sm" data-testid="dashboard-sessions-btn">
                Industry Sessions
              </button>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Sessions */}
        <div className="glass-panel p-6" data-testid="dashboard-upcoming-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="wordmark text-lg text-white">Upcoming Sessions</div>
            <Link to="/sessions" className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
              View Calendar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {overview.upcoming_sessions.slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => navigate(`/sessions/${s.id}`)}
                data-testid={`upcoming-session-${s.id}`}
                className="w-full text-left flex items-center gap-3 glass-interactive px-3 py-3">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  {s.cover_image && <img src={s.cover_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-semibold truncate">{s.title}</div>
                  <div className="text-zinc-500 text-xs truncate">with {s.host_name}</div>
                </div>
                {s.status === "live" ? (
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full bg-[#F97316]/20 text-[#FDBA74] border border-[#F97316]/30">Live</span>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full bg-white/[0.05] text-zinc-400 border border-white/10">Join</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Industry Professionals", value: stats.industry_professionals },
          { icon: Award, label: "Expert Categories", value: stats.expert_categories },
          { icon: Globe2, label: "Countries Represented", value: stats.countries },
          { icon: Handshake, label: "Active Mentorships", value: stats.active_mentorships },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-panel p-5">
            <s.icon className="w-5 h-5 text-[#00F0FF] mb-3" />
            <div className="wordmark text-3xl text-white">{s.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Featured mentors */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="wordmark text-2xl text-white">Featured Mentors & Partners</h2>
            <div className="text-zinc-500 text-sm">Learn from and collaborate with verified industry leaders.</div>
          </div>
          <Link to="/directory" className="text-sm text-zinc-500 hover:text-white flex items-center gap-1" data-testid="dashboard-view-directory">
            View Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {featured.map((p, i) => <MentorCard key={p.user_id} p={p} index={i} />)}
        </div>
      </section>

      {/* Bento grid: AIAH + Opportunities + Cohorts + Messages */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AIAH */}
        <div className="glass-panel p-6 relative overflow-hidden lg:col-span-2" data-testid="dashboard-aiah-panel">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-cohesion opacity-20 blur-3xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-cohesion grid place-items-center text-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">AI Leadership Intelligence</div>
              <div className="wordmark text-xl text-white">AIAH — Ecosystem Insight</div>
            </div>
          </div>
          {insight ? (
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-body">{insight}</pre>
          ) : (
            <div className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              AIAH assists faculty and professionals with portfolio gap analysis, meeting summaries, cohort
              balancing, career readiness, and follow-up action items — always referencing your ANCR ecosystem
              signals. It supports human leadership; it never replaces it.
            </div>
          )}
          <button
            data-testid="dashboard-aiah-run-btn"
            onClick={runAIAH} disabled={insightBusy}
            className="btn-primary text-xs mt-6 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" />
            {insightBusy ? "Generating…" : (isStudent ? "Run Career Readiness Snapshot" : "Run Portfolio Gap Analysis")}
          </button>
        </div>

        {/* Opportunities */}
        <div className="glass-panel p-6" data-testid="dashboard-opps-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="wordmark text-lg text-white">Fresh Opportunities</div>
            <Link to="/opportunities" className="text-xs text-zinc-500 hover:text-white">View all</Link>
          </div>
          <div className="space-y-3">
            {overview.opportunities.slice(0, 4).map((o) => (
              <div key={o.id} className="glass-interactive p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white text-sm font-semibold">{o.title}</div>
                  <RoleChip tone="orange">{o.kind.replace(/_/g, " ")}</RoleChip>
                </div>
                <div className="text-zinc-500 text-xs">{o.company} · {o.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews + Cohorts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reviews */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Recent Reviews → ANCRID™</div>
              <div className="wordmark text-lg text-white">Professional Reviews</div>
            </div>
            <Link to="/reviews" className="text-xs text-zinc-500 hover:text-white">View all</Link>
          </div>
          <div className="space-y-3">
            {overview.reviews.slice(0, 3).map((r) => {
              const avg = Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / Object.values(r.scores).length * 10) / 10;
              return (
                <div key={r.id} className="glass-interactive p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white text-sm font-semibold">{r.reviewer_name}</div>
                    <div className="font-mono text-[10px] text-[#00F0FF]">{avg}/10 avg</div>
                  </div>
                  <div className="text-zinc-500 text-xs line-clamp-2">{r.comments}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cohorts */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Under Supervision</div>
              <div className="wordmark text-lg text-white">Your Cohorts</div>
            </div>
            <Link to="/cohorts" className="text-xs text-zinc-500 hover:text-white">View all</Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {overview.cohorts.slice(0, 4).map((c) => (
              <Link key={c.id} to={`/cohorts/${c.id}`} className="glass-interactive p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  {c.cover_image && <img src={c.cover_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{c.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {c.student_ids?.length || 0} students · {c.mentor_ids?.length || 0} mentors
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How COHEIR works strip */}
      <section className="glass-panel p-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">How COHEIR Works</div>
            <h3 className="wordmark text-2xl text-white">Connect. Collaborate. Learn. Grow.</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { i: Compass, k: "1. Connect", d: "Discover verified industry leaders across every discipline." },
            { i: CalendarDays, k: "2. Collaborate", d: "Book studio sessions, writing camps, and portfolio reviews." },
            { i: Music2, k: "3. Learn", d: "Every review permanently updates your ANCRID™." },
            { i: Rocket, k: "4. Launch", d: "Opportunities and recommendations lead directly to career milestones." },
          ].map((step) => (
            <div key={step.k} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full grid place-items-center bg-white/[0.05] border border-white/10">
                <step.i className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div>
                <div className="wordmark text-white text-sm">{step.k}</div>
                <div className="text-zinc-500 text-xs leading-relaxed mt-1">{step.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
