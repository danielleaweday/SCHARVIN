import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { BookOpen, ArrowRight } from "lucide-react";

export function ContinueLearning() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.get("/learning/current")
      .then(({ data }) => { if (alive) setLesson(data); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <section data-testid="continue-learning" className="glass rounded-3xl p-6 fade-up glass-hover relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: "#D97706" }} />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-3">
          <BookOpen className="w-3.5 h-3.5" /> Continue learning
        </div>
        {loading ? (
          <div className="text-white/50 text-sm">Loading…</div>
        ) : lesson ? (
          <>
            <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{lesson.pathway}</div>
            <h3 className="font-display text-2xl leading-tight mt-1">{lesson.title}</h3>
            <div className="mt-4">
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full viearta-gradient-bg" style={{ width: `${lesson.progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-white/50">
                {lesson.completed_lessons} of {lesson.total_lessons} lessons · {lesson.progress}%
              </div>
            </div>
            <button
              data-testid="continue-learning-btn"
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-sans bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
            >
              Continue lesson <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-white/50 text-sm">Choose a pathway in Learning to begin.</div>
        )}
      </div>
    </section>
  );
}
