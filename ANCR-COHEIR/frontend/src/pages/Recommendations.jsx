import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";

export default function Recommendations() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/recommendations").then(({ data }) => setItems(data)); }, []);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Recommendations</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Verified references → ANCRID™.</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((r) => (
          <div key={r.id} className="glass-panel p-6" data-testid={`rec-card-${r.id}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-semibold">{r.recommender_name}</div>
              <RoleChip tone="orange">{r.for_type.replace(/_/g, " ")}</RoleChip>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Target: {r.target}</div>
            <blockquote className="text-zinc-300 italic border-l-2 border-[#00F0FF]/50 pl-3">
              "{r.narrative}"
            </blockquote>
            <div className="mt-4 flex items-center gap-2">
              <RoleChip tone="blue">Verified</RoleChip>
              <RoleChip tone="zinc">Written into ANCRID™</RoleChip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
