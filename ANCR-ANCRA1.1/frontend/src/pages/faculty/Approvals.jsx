import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section } from "@/components/common/Primitives";
import { Check, X, Eye } from "lucide-react";

export default function Approvals() {
  const { data } = useSWR("/faculty/reviews", get);
  const list = data?.reviews || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Approvals Queue"
        title={<span><em className="italic text-ancr-dim">Move</em> student work forward</span>}
      />
      <div className="mt-10 space-y-3">
        {list.map((r) => (
          <div key={r.id} className="ancr-card group flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <img src={r.avatar} className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10" alt="" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="font-serif text-lg leading-tight">{r.student}</div>
                <span className={`font-mono text-[10px] uppercase tracking-wider ${
                  r.priority === "high" ? "text-[var(--ancra-accent)]" :
                  r.priority === "medium" ? "text-amber-300" : "text-ancr-dim"
                }`}>{r.priority}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-ancr-dim">
                {r.kind} · {r.experience} · {r.submitted}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3" data-testid={`preview-${r.id}`}><Eye size={11} /> Preview</button>
              <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3" data-testid={`accept-${r.id}`}><Check size={11} /> Approve</button>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3" data-testid={`reject-${r.id}`}><X size={11} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
