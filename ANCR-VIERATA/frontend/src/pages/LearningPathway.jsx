import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Award } from "lucide-react";

export default function LearningPathway() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pw, setPw] = useState(null);

  useEffect(() => {
    api.get(`/learning/pathways/${id}`).then(({ data }) => setPw(data));
  }, [id]);

  if (!pw) return <div className="text-white/50 text-sm">Loading…</div>;

  return (
    <div className="fade-up" data-testid="pathway-page">
      <button onClick={() => navigate("/learning")} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Learning
      </button>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{pw.category}</div>
        <h1 className="font-display text-4xl tracking-tight mt-1">{pw.title}</h1>
        <p className="text-white/65 mt-2 max-w-2xl">{pw.summary}</p>
        <div className="mt-5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full viearta-gradient-bg" style={{ width: `${pw.progress}%` }} />
        </div>
        <div className="mt-2 text-xs text-white/55">
          {pw.completed_lessons} of {pw.total_lessons} lessons completed · {pw.progress}%
        </div>
      </section>

      <ol className="space-y-3" data-testid="lessons-list">
        {pw.lessons.map((ls) => (
          <li key={ls.id}>
            <button onClick={() => navigate(`/learning/${pw.id}/${ls.id}`)} data-testid={`lesson-${ls.id}`}
              className="w-full text-left glass rounded-2xl p-4 sm:p-5 glass-hover flex items-start gap-4">
              {ls.credit_earned ? (
                <Award className="w-5 h-5 text-viearta-teal shrink-0 mt-0.5" />
              ) : ls.status === "reflected" || ls.status === "tool_launched" ? (
                <CheckCircle2 className="w-5 h-5 text-white/50 shrink-0 mt-0.5" />
              ) : ls.status === "read" ? (
                <CheckCircle2 className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-white/25 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Lesson {ls.order} · {ls.estimated_minutes} min</div>
                <div className="font-display text-xl mt-0.5">{ls.title}</div>
                <div className="mt-1 text-xs text-white/50">
                  {ls.credit_earned ? "Credit earned · participated + reflected" :
                    ls.status === "reflected" ? "Reflected — launch the tool to earn credit" :
                    ls.status === "tool_launched" ? "Tool launched — add a reflection to earn credit" :
                    ls.status === "read" ? "Read — next: launch the tool" : "Not started"}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 mt-1" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
