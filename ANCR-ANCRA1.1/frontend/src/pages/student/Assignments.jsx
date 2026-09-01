import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";

const STATUS = {
  not_started: { label: "Not Started", tone: "default" },
  in_progress: { label: "In Progress", tone: "accent" },
  submitted:   { label: "Submitted",   tone: "success" },
};

const PRIORITY = {
  high:   "text-[var(--ancra-accent)]",
  medium: "text-amber-300",
  low:    "text-ancr-dim",
};

export default function Assignments() {
  const { data } = useSWR("/student/assignments", get);
  const list = data?.assignments || [];

  const cols = {
    not_started: list.filter((a) => a.status === "not_started"),
    in_progress: list.filter((a) => a.status === "in_progress"),
    submitted:   list.filter((a) => a.status === "submitted"),
  };

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Assignments"
        title={<span><em className="italic text-ancr-dim">Move</em> work through the studio</span>}
      />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(cols).map(([key, items]) => (
          <div key={key} className="ancr-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
              <div className="ancr-label">{STATUS[key].label}</div>
              <div className="font-mono text-[10px] text-ancr-mute">{items.length}</div>
            </div>
            <div className="space-y-2 p-3">
              {items.map((a) => (
                <div key={a.id} data-testid={`assignment-${a.id}`} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-4 hover:border-white/15 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-serif text-base leading-tight">{a.title}</div>
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${PRIORITY[a.priority]}`}>{a.priority}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Chip>{a.experience}</Chip>
                    <Chip>{a.kind}</Chip>
                  </div>
                  <div className="mt-3 font-mono text-[10px] text-ancr-mute">Due {a.due}</div>
                </div>
              ))}
              {items.length === 0 && <div className="p-6 text-center font-mono text-[10px] text-ancr-mute">Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
