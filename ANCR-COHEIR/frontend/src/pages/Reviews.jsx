import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";

const CATEGORIES = ["creative_growth", "technical_ability", "professionalism", "communication", "leadership", "collaboration", "innovation", "entrepreneurship", "industry_readiness"];

export default function Reviews() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/reviews").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Professional Reviews</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Verified evaluations → ANCRID™.</h1>
      </header>
      <div className="space-y-3">
        {items.map((r) => {
          const avg = Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / Object.values(r.scores).length * 10) / 10;
          return (
            <div key={r.id} className="glass-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">{r.reviewer_name}</div>
                <div className="flex items-center gap-2">
                  <RoleChip tone="blue">Avg {avg}/10</RoleChip>
                  <RoleChip tone="zinc">Published to ANCRID™</RoleChip>
                </div>
              </div>
              <div className="text-zinc-400 text-sm mb-3">{r.comments}</div>
              <div className="grid grid-cols-3 md:grid-cols-9 gap-1.5">
                {CATEGORIES.map((k) => (
                  <div key={k} className="rounded-md bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{k.replace(/_/g, " ")}</div>
                    <div className="text-white text-sm font-semibold">{r.scores[k]}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
