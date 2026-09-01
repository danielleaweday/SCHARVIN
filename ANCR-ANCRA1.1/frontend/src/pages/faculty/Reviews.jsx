import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section } from "@/components/common/Primitives";

export default function Reviews() {
  const { data } = useSWR("/faculty/reviews", get);
  const list = data?.reviews || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Reviews" title="Portfolio & Live Critique" />
      <div className="mt-8 ancr-card overflow-hidden">
        <div className="grid grid-cols-12 border-b border-white/[0.06] px-5 py-3 font-mono text-[9px] uppercase tracking-widest text-ancr-mute">
          <div className="col-span-4">Student</div>
          <div className="col-span-3">Kind</div>
          <div className="col-span-3">Experience</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1 text-right">Age</div>
        </div>
        {list.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center border-b border-white/[0.04] px-5 py-3 hover:bg-white/[0.02]">
            <div className="col-span-4 flex items-center gap-3">
              <img src={r.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
              <div className="font-serif text-[14px]">{r.student}</div>
            </div>
            <div className="col-span-3 text-[12px] text-ancr-dim">{r.kind}</div>
            <div className="col-span-3 text-[12px] text-ancr-dim">{r.experience}</div>
            <div className={`col-span-1 font-mono text-[10px] uppercase tracking-wider ${
              r.priority === "high" ? "text-[var(--ancra-accent)]" :
              r.priority === "medium" ? "text-amber-300" : "text-ancr-dim"
            }`}>{r.priority}</div>
            <div className="col-span-1 text-right font-mono text-[11px] text-ancr-mute">{r.submitted}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
