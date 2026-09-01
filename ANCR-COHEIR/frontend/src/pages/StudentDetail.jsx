import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip, VerifiedBadge } from "@/components/coheir/MentorCard";
import { GraduationCap, Sparkles, MapPin, Fingerprint, MessageSquare, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function StudentDetail() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [s, setS] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [scores, setScores] = useState({
    creative_growth: 8, technical_ability: 8, professionalism: 8, communication: 8,
    leadership: 7, collaboration: 8, innovation: 8, entrepreneurship: 7, industry_readiness: 8,
  });
  const [form, setForm] = useState({ comments: "", recommendations: "", growth_plan: "" });

  const load = () => api.get(`/students/${userId}`).then(({ data }) => setS(data));
  useEffect(() => { load(); }, [userId]);

  const submitReview = async () => {
    try {
      await api.post("/reviews", { student_id: userId, scores, ...form });
      toast.success("Review published — ANCRID™ updated.");
      setShowReview(false);
      setForm({ comments: "", recommendations: "", growth_plan: "" });
      load();
    } catch (e) { toast.error("Failed to publish review"); }
  };

  if (!s) return <div className="text-zinc-500 font-mono text-xs">Loading student…</div>;
  const canReview = user && user.role !== "student";

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex flex-col lg:flex-row items-start gap-6">
        <div className="w-28 h-28 rounded-2xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
          {s.picture ? <img src={s.picture} alt={s.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-cohesion" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <RoleChip tone="blue">Student</RoleChip>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1"><Fingerprint className="w-3 h-3" /> {s.ancrid}</div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="wordmark text-4xl text-white">{s.name}</h1>
            {s.verified && <VerifiedBadge />}
          </div>
          <div className="text-zinc-400 mt-1 flex items-center gap-3 flex-wrap text-sm">
            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {s.program}</span>
            {s.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {s.location}</span>}
            {s.graduation_year && <span>Class of {s.graduation_year}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {(s.skills || []).map((sk) => <RoleChip key={sk} tone="zinc">{sk}</RoleChip>)}
          </div>
        </div>
        <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
          <div className="glass-interactive p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Career Readiness</div>
            <div className="wordmark text-4xl text-white">{s.career_readiness || 0}<span className="text-zinc-500 text-xl">/100</span></div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
              <div className="h-full bg-gradient-cohesion" style={{ width: `${s.career_readiness || 0}%` }} />
            </div>
          </div>
          {canReview && (
            <button onClick={() => setShowReview((v) => !v)} data-testid="student-add-review-btn"
              className="btn-primary text-sm w-full flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Professional Review
            </button>
          )}
          <button onClick={() => toast.success("Direct message opened")}
            className="btn-outline text-sm w-full flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> Message
          </button>
        </div>
      </div>

      {/* Ecosystem quick view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ANCRLAB™</div>
          <div className="wordmark text-lg text-white mb-3">Creative Portfolio</div>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li>· Halo Country EP — Vocal comps v3</li>
            <li>· "Amber Ceiling" — topline session</li>
            <li>· "Cathedral, LA" — reference mixes</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ANCRSync™</div>
          <div className="wordmark text-lg text-white mb-3">Live Collaborations</div>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li>· Halo Country EP — Team room</li>
            <li>· Writing Camp — Nashville Rooms</li>
            <li>· A&R Insights — Panel</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">INHEIRA™</div>
          <div className="wordmark text-lg text-white mb-3">Publishing Metadata</div>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li>· 2 splits pending signature</li>
            <li>· PRO: ASCAP registered</li>
            <li>· Publisher: Kobalt / AWAL (in review)</li>
          </ul>
        </div>
      </div>

      {/* Reviews list */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Professional Reviews → ANCRID™</div>
            <div className="wordmark text-xl text-white">Verified Reviews</div>
          </div>
        </div>
        <div className="space-y-3">
          {(s.reviews || []).length === 0 && <div className="text-zinc-500 text-sm">No reviews yet.</div>}
          {(s.reviews || []).map((r) => {
            const avg = Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / Object.values(r.scores).length * 10) / 10;
            return (
              <div key={r.id} className="glass-interactive p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-semibold">{r.reviewer_name}</div>
                  <div className="font-mono text-[10px] text-[#00F0FF]">{avg}/10 avg</div>
                </div>
                <div className="text-zinc-400 text-sm">{r.comments}</div>
                <div className="mt-3 grid grid-cols-3 md:grid-cols-9 gap-1.5">
                  {Object.entries(r.scores).map(([k, v]) => (
                    <div key={k} className="rounded-md bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{k.replace(/_/g, " ")}</div>
                      <div className="text-white text-sm font-semibold">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                  <div className="text-zinc-500"><span className="text-zinc-400">Recommendations:</span> {r.recommendations}</div>
                  <div className="text-zinc-500"><span className="text-zinc-400">Growth Plan:</span> {r.growth_plan}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-panel p-6">
        <div className="wordmark text-xl text-white mb-4">Recommendations</div>
        <div className="space-y-3">
          {(s.recommendations || []).length === 0 && <div className="text-zinc-500 text-sm">No recommendations yet.</div>}
          {(s.recommendations || []).map((r) => (
            <div key={r.id} className="glass-interactive p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-white font-semibold">{r.recommender_name}</div>
                <RoleChip tone="orange">{r.for_type.replace(/_/g, " ")}</RoleChip>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Target: {r.target}</div>
              <div className="text-zinc-400 text-sm">{r.narrative}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review form */}
      {showReview && canReview && (
        <div className="glass-panel p-6">
          <div className="wordmark text-xl text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#00F0FF]" /> New Professional Review</div>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {Object.entries(scores).map(([k, v]) => (
              <label key={k} className="text-xs text-zinc-400 flex flex-col gap-1">
                <span className="font-mono uppercase tracking-widest">{k.replace(/_/g, " ")}</span>
                <input type="range" min={1} max={10} value={v}
                  onChange={(e) => setScores({ ...scores, [k]: Number(e.target.value) })}
                  className="accent-[#00F0FF]" />
                <div className="text-white text-sm">{v}/10</div>
              </label>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {[["comments", "Comments"], ["recommendations", "Recommendations"], ["growth_plan", "Growth Plan"]].map(([k, l]) => (
              <textarea key={k} placeholder={l} rows={4}
                value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none" />
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={submitReview} className="btn-primary text-sm" data-testid="student-review-submit">Publish Review → ANCRID™</button>
            <button onClick={() => setShowReview(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
