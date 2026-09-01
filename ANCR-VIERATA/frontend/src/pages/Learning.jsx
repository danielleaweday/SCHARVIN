import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { BookOpen, GraduationCap, ArrowRight, Award, Sparkles } from "lucide-react";

const CATEGORY_COLORS = {
  voice: "#9333EA", hearing: "#14B8A6", performance: "#E11D48",
  recovery: "#EA580C", body: "#D97706", mind: "#9333EA",
};

export default function Learning() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    api.get("/learning/pathways").then(({ data }) => setItems(data.items));
    api.get("/learning/credits").then(({ data }) => setCredits(data.total));
  }, []);

  return (
    <div className="fade-up" data-testid="learning-page">
      <section className="glass rounded-3xl p-8 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> VIEARTA Learning
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Read a lesson. Practice it. <span className="viearta-gradient">Reflect on the shape.</span>
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">Each lesson opens the matching tool in Lifestyle so the idea becomes lived practice. Credit is earned by participation and reflection — not by hitting a number.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/60"><Award className="w-4 h-4 text-viearta-teal" /> {credits} lesson credit{credits === 1 ? "" : "s"} earned</div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="pathways">
        {items.map((pw) => {
          const c = CATEGORY_COLORS[pw.category] || "#14B8A6";
          return (
            <button key={pw.id} onClick={() => navigate(`/learning/${pw.id}`)} data-testid={`pw-${pw.id}`}
              className="text-left glass rounded-3xl p-6 glass-hover relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: c }} />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: c }}>{pw.category}</div>
                <h3 className="font-display text-2xl mt-1">{pw.title}</h3>
                <p className="text-white/60 text-sm mt-1">{pw.summary}</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full viearta-gradient-bg" style={{ width: `${pw.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                  <span>{pw.completed_lessons} / {pw.total_lessons} lessons</span>
                  <span className="inline-flex items-center gap-1 group-hover:text-white">Open <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
