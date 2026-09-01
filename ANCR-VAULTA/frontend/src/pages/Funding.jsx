import { useEffect, useState, useMemo } from "react";
import api, { formatMoney } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { Sparkles, Calendar, ArrowUpRight, Search, Filter, TrendingUp, Award, Clock, Target, Bot } from "lucide-react";

const CATEGORY_TONE = {
  "National grants":         "text-cyan-400",
  "State grants":            "text-violet-400",
  "International grants":    "text-orange-400",
  "Scholarships":            "text-emerald-400",
  "Fellowships":             "text-pink-400",
  "Creative residencies":    "text-yellow-400",
  "Artist incubators":       "text-blue-400",
  "Accelerator programs":    "text-fuchsia-400",
  "Competitions":            "text-teal-400",
  "Pitch opportunities":     "text-red-400",
  "Venture funding":         "text-indigo-400",
  "Angel investors":         "text-lime-400",
  "Foundation funding":      "text-amber-400",
  "Nonprofit funding":       "text-rose-400",
  "Music industry funding":  "text-sky-400",
  "Crowdfunding":            "text-purple-400",
};

const STATUS_TONE = {
  "In Progress": "warning",
  "Submitted":   "info",
  "Awarded":     "success",
  "Rejected":    "danger",
};

export default function Funding() {
  const [summary, setSummary] = useState(null);
  const [opps, setOpps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/grants/summary").then((r) => setSummary(r.data));
    api.get("/grants/opportunities").then((r) => { setOpps(r.data.opportunities); setCategories(r.data.categories); });
    api.get("/grants/applications").then((r) => setApps(r.data));
  }, []);

  const filteredOpps = useMemo(() => {
    return opps.filter((o) => {
      if (filter !== "All" && o.category !== filter) return false;
      if (q && !`${o.name} ${o.organization}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [opps, filter, q]);

  if (!summary) return <div className="text-white/40 text-sm">Loading Grant & Funding Center…</div>;

  return (
    <div className="space-y-8" data-testid="funding-page">
      <PageHeader
        kicker="Grant & Funding Center™"
        title={<>Every opportunity, <span className="gradient-text">curated by AIAH.</span></>}
        subtitle="National · State · International grants. Scholarships. Fellowships. Residencies. Incubators. Accelerators. Competitions. Ventures. Foundations. All matched to your creator profile."
      />

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KPICard label="Lifetime Secured" value={summary.total_secured} accent="grad" compact testid="funding-kpi-secured" />
        <KPICard label="Active Pipeline" value={summary.total_pipeline} accent="violet" compact />
        <KPICard label="In Progress" value={String(summary.in_progress_count)} accent="orange" testid="funding-kpi-inprogress" />
        <KPICard label="Submitted" value={String(summary.submitted_count)} accent="blue" />
        <KPICard label="Win Rate" value={`${summary.win_rate}%`} accent="green" sub={`${summary.awarded_count} won / ${summary.rejected_count} rejected`} />
        <KPICard label="Opportunities Tracked" value={String(opps.length)} accent="blue" />
      </div>

      {/* Upcoming Deadlines */}
      <GlassCard testid="funding-deadlines">
        <SectionHeader
          kicker="Timeline · Next 120 Days"
          title="Upcoming Deadlines"
          action={
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <Clock size={12} /> {summary.upcoming_deadlines.length} opportunities open
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {summary.upcoming_deadlines.map((o) => (
            <div key={o.id} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-[2px] w-14 ${(CATEGORY_TONE[o.category] || 'text-white').replace('text-','bg-')}`} />
              <div className="flex items-center justify-between mb-2">
                <div className={`text-[9.5px] tracking-[0.22em] uppercase font-semibold ${CATEGORY_TONE[o.category] || 'text-white'}`}>
                  {o.category}
                </div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-white/50 font-mono-tab">
                  {o.days_until}d
                </div>
              </div>
              <div className="font-display text-[15px] leading-tight mb-1">{o.name}</div>
              <div className="text-[11px] text-white/50 mb-3">{o.organization}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="eyebrow">Award</div>
                  <div className="kpi-value text-[15px] mt-0.5">{formatMoney(o.amount)}</div>
                </div>
                <div className="text-right">
                  <div className="eyebrow">Match</div>
                  <div className={`text-[13px] mt-0.5 font-medium ${o.ai_match_score >= 85 ? 'text-emerald-400' : o.ai_match_score >= 70 ? 'text-cyan-400' : 'text-white/60'}`}>
                    {o.ai_match_score}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Applications tracker */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2" testid="funding-applications">
          <SectionHeader kicker="Pipeline" title="Applications" />
          <div className="overflow-x-auto">
            <table className="w-full exec-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Decision</th>
                  <th className="text-right">Awarded</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-medium">{a.opportunity_name}</div>
                      <div className="text-[10.5px] text-white/40">{a.notes}</div>
                    </td>
                    <td><StatusPill status={a.status} /></td>
                    <td>
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full ${a.status === "Awarded" ? "bg-emerald-400" : a.status === "Rejected" ? "bg-orange-400" : "gradient-bar"}`} style={{ width: `${a.progress}%` }} />
                        </div>
                        <div className="text-[10.5px] text-white/50 font-mono-tab">{a.progress}%</div>
                      </div>
                    </td>
                    <td className="text-white/55 text-[11.5px]">{a.decision_date || "—"}</td>
                    <td className="text-right font-medium">
                      {a.amount_awarded ? <span className="text-emerald-400">{formatMoney(a.amount_awarded)}</span> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard testid="funding-aiah-advisor">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-bar flex items-center justify-center">
              <Bot size={13} className="text-black" />
            </div>
            <div>
              <div className="text-[13px] font-medium">AI Funding Advisor™</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">AIAH · Claude Sonnet 4.5</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { tone: "green",  title: "Highest match — ASCAP Grant",   body: "93% match. You're ASCAP-affiliated with 6+ registered works. 12-hour app." },
              { tone: "blue",   title: "Deadline in 18 days — SXSW",    body: "Emerging talent showcase. Your streaming numbers qualify you." },
              { tone: "violet", title: "Kickstarter — high confidence", body: "You have the audience. Estimated $45–60K raise potential." },
              { tone: "orange", title: "Reapply — SXSW 2026 window",    body: "Last cycle you were close. Refine EPK and reapply." },
            ].map((i, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    i.tone === "blue"   ? "bg-cyan-400"    :
                    i.tone === "orange" ? "bg-orange-400"  :
                    i.tone === "violet" ? "bg-violet-400"  : "bg-emerald-400"
                  }`} />
                  <div className="text-[12px] font-semibold">{i.title}</div>
                </div>
                <div className="text-[11px] text-white/60 leading-relaxed">{i.body}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Opportunities Explorer */}
      <div>
        <SectionHeader
          kicker="Explorer · 25+ Curated Sources"
          title="All Opportunities"
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-[12px] w-56">
                <Search size={12} className="text-white/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search organizations…"
                  data-testid="funding-search"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30"
                />
              </div>
            </div>
          }
        />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3">
          <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>All</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</FilterChip>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="funding-opportunities">
          {filteredOpps.map((o) => (
            <GlassCard key={o.id} hover className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-[2px] w-16 ${(CATEGORY_TONE[o.category] || 'text-white').replace('text-','bg-')}`} />
              <div className="flex items-center justify-between mb-2">
                <div className={`text-[9.5px] tracking-[0.22em] uppercase font-semibold ${CATEGORY_TONE[o.category] || 'text-white'}`}>
                  {o.category}
                </div>
                <div className={`text-[11px] font-medium ${o.ai_match_score >= 85 ? 'text-emerald-400' : o.ai_match_score >= 70 ? 'text-cyan-400' : 'text-white/50'}`}>
                  {o.ai_match_score}% match
                </div>
              </div>
              <div className="font-display text-[16px] leading-tight mb-1">{o.name}</div>
              <div className="text-[11px] text-white/50 mb-3">{o.organization} · {o.location}</div>

              <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-white/[0.05]">
                <Mini label="Amount" value={formatMoney(o.amount)} tone="text-white" />
                <Mini label="Deadline" value={o.deadline} tone="text-white/70" />
                <Mini label="Difficulty" value={`${o.difficulty_score}/100`} tone={o.difficulty_score > 85 ? "text-orange-400" : "text-white/70"} />
              </div>

              <div className="text-[11px] text-white/55 leading-relaxed mb-2">
                <span className="text-white/40">Eligibility:</span> {o.eligibility}
              </div>
              <div className="text-[10.5px] text-white/45 mb-3">
                <span className="text-white/40">~{o.estimated_hours}h to apply</span> · {o.documents_required.length} docs required
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <div className="text-[10.5px] text-white/45">
                  {o.previous_winners.length > 0 && <>Prev winners: {o.previous_winners.slice(0, 2).join(", ")}</>}
                </div>
                <button className="text-[11px] text-cyan-400 hover:text-white flex items-center gap-1" data-testid={`funding-apply-${o.id}`}>
                  Start <ArrowUpRight size={11} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border transition-colors ${
        active
          ? "border-white/30 bg-white/[0.06] text-white"
          : "border-white/[0.06] bg-white/[0.02] text-white/55 hover:text-white hover:border-white/[0.12]"
      }`}
    >
      {children}
    </button>
  );
}

function Mini({ label, value, tone = "text-white/70" }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={`text-[12px] mt-0.5 font-medium ${tone}`}>{value}</div>
    </div>
  );
}
