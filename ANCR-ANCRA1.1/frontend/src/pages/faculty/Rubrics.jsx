import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles, Plus, GripVertical } from "lucide-react";

const RUBRICS = [
  { id: "r1", name: "Songwriting · First-Eight", assignments: 4, criteria: 4, published: true },
  { id: "r2", name: "Mix · Console Fluency", assignments: 3, criteria: 5, published: true },
  { id: "r3", name: "Peer Critique · Signal", assignments: 6, criteria: 3, published: true },
  { id: "r4", name: "Live Performance · Stagecraft", assignments: 2, criteria: 6, published: false },
];

const ACTIVE = [
  { c: "Emotional Contract", weight: 30, desc: "Does the opening carry the emotional load of the record?" },
  { c: "Prosody", weight: 25, desc: "Vowel stress, breath placement, syllable-to-note fit." },
  { c: "Melodic Kernel", weight: 25, desc: "A replayable idea a listener can sing back." },
  { c: "Reflection", weight: 20, desc: "Self-awareness of choices made." },
];

export default function Rubrics() {
  const [active, setActive] = React.useState(RUBRICS[0].id);
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Rubrics"
        title={<span><em className="italic text-ancr-dim">Assessment,</em> as a design object</span>}
        sub="Rubrics are shared across assignments and cohorts. Every criterion carries a weight and a description — every score becomes a signed signal on ANCRID™."
        right={<button className="ancr-btn ancr-btn-primary"><Plus size={12} /> New Rubric</button>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="ancr-label">Library · {RUBRICS.length}</div>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {RUBRICS.map((r) => (
              <button
                key={r.id}
                data-testid={`rubric-${r.id}`}
                onClick={() => setActive(r.id)}
                className={`flex w-full items-center justify-between px-5 py-4 text-left transition ${active === r.id ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}
              >
                <div>
                  <div className="font-serif text-[15px]">{r.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute">{r.criteria} criteria · {r.assignments} assignments</div>
                </div>
                <Chip tone={r.published ? "success" : "warn"}>{r.published ? "live" : "draft"}</Chip>
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-8 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="ancr-label">Editing</div>
              <div className="mt-1 font-serif text-2xl">Songwriting · First-Eight</div>
            </div>
            <div className="font-mono text-[11px] text-ancr-dim">Weights total <span className="text-white">100</span></div>
          </div>
          <div className="p-5 space-y-2">
            {ACTIVE.map((c, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <GripVertical size={14} className="text-ancr-mute mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <input defaultValue={c.c} className="flex-1 bg-transparent font-serif text-[15px] outline-none" />
                    <div className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 font-mono text-[11px]">
                      <input defaultValue={c.weight} className="w-6 bg-transparent text-right outline-none" />%
                    </div>
                  </div>
                  <textarea rows={2} defaultValue={c.desc} className="mt-2 w-full resize-none bg-transparent text-[13px] leading-relaxed text-ancr-dim outline-none" />
                </div>
              </div>
            ))}
            <button className="ancr-btn ancr-btn-ghost mt-2 text-[10px] py-1.5 px-3"><Plus size={11} /> Add criterion</button>
          </div>

          <div className="border-t border-white/[0.06] p-5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ suggests adding a criterion for "Structural Repetition" (10%)</div>
            </div>
            <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Insert</button>
          </div>
        </div>
      </div>
    </div>
  );
}
