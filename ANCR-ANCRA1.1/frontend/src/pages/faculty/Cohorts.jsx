import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section } from "@/components/common/Primitives";

export default function Cohorts() {
  const { data } = useSWR("/faculty/cohorts", get);
  const list = data?.cohorts || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Cohorts" title="Composition & health" />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="ancr-card p-6">
            <div className="ancr-label">{c.students} students</div>
            <div className="mt-1 font-serif text-2xl leading-tight">{c.name}</div>
            <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-[10px] text-ancr-dim uppercase tracking-wider">
              <div>
                <div className="text-white text-3xl font-serif">{c.avg_score}</div>
                Portfolio avg
              </div>
              <div>
                <div className="text-emerald-300 text-3xl font-serif">{c.graduation_ready}</div>
                Grad-ready
              </div>
              <div className="text-[var(--ancra-accent)]">
                <div className="text-3xl font-serif">{c.at_risk}</div>
                At-risk
              </div>
            </div>
            {c.concentration_mix && <div className="mt-6 font-mono text-[10px] text-ancr-mute leading-relaxed">{c.concentration_mix}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
