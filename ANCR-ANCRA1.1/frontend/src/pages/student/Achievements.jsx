import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section } from "@/components/common/Primitives";
import { Award } from "lucide-react";

export default function Achievements() {
  const { data } = useSWR("/student/achievements", get);
  const list = data?.achievements || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Signals" title={<span><em className="italic text-ancr-dim">Your</em> milestones</span>} />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <div key={a.id} className="ancr-card p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full border border-white/10 p-2.5"><Award size={16} className="text-[var(--ancra-accent)]" /></div>
              <div className="ancr-label">{a.kind}</div>
            </div>
            <div className="mt-4 font-serif text-xl leading-tight">{a.title}</div>
            <div className="mt-2 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">{a.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
