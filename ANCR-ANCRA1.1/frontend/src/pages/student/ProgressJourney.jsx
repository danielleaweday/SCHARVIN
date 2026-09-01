import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Check, Sparkles } from "lucide-react";

const PHASES = [
  { id: 1, label: "Foundations", when: "May 2024", done: true, desc: "Studio literacy · instrument fundamentals · first INHEIRA registration.", experiences: ["Studio 101", "Voice & Instrument"] },
  { id: 2, label: "Studio Fluency", when: "Dec 2024", done: true, desc: "Working session cadence established. 5 songs written. First peer critiques.", experiences: ["Production Lab I", "Songwriting I"] },
  { id: 3, label: "Concentration", when: "In progress", current: true, desc: "Deep dive into Songwriting & Production. 12 lessons · 6 songs · 2 industry sessions.", experiences: ["Songwriting Architecture", "Production Lab II", "The Deal Room"], progress: 68 },
  { id: 4, label: "Mid-Program Portfolio Review", when: "Feb 2026", desc: "Live panel of faculty + industry professionals reviewing 5 works.", experiences: ["Portfolio Panels"] },
  { id: 5, label: "Capstone Development", when: "Fall 2026", desc: "Ship debut EP + publishing thesis. Advisor + industry reviewer assigned.", experiences: ["Capstone Studio"] },
  { id: 6, label: "Industry Placement · ANCRLaunch™", when: "Spring 2027", desc: "Employer viewing sessions, mock deal rooms, Creator Mobility™ activation.", experiences: ["ANCRLaunch Bootcamp"] },
];

export default function ProgressJourney() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Learning Journey™"
        title={<span><em className="italic text-ancr-dim">The arc</em> of your creative development</span>}
        sub="Every CCDP student moves through six phases across three years. The journey is designed — not accidental — and every phase feeds the next."
      />

      <div className="mt-14 relative">
        {/* Vertical spine */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/[0.06]" />
        <div className="space-y-14">
          {PHASES.map((p, i) => {
            const alignRight = i % 2 === 0;
            return (
              <div key={p.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black">
                  {p.done ? <Check size={14} className="text-white" /> : p.current ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--ancra-accent)] shadow-[0_0_16px_var(--ancra-accent-glow)]" />
                  ) : <div className="h-1.5 w-1.5 rounded-full bg-white/40" />}
                </div>

                <div className={`${alignRight ? "md:col-start-1 md:pr-16" : "md:col-start-2 md:pl-16"} pl-16 md:pl-0`}>
                  <div className={`ancr-label ${p.current ? "text-[var(--ancra-accent)]" : ""}`}>{p.done ? "Complete" : p.current ? "Current" : "Ahead"} · {p.when}</div>
                  <h3 className="mt-2 font-serif text-3xl leading-tight">{p.label}</h3>
                  <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-ancr-dim">{p.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.experiences.map((e) => <Chip key={e}>{e}</Chip>)}
                  </div>
                  {p.progress !== undefined && (
                    <div className="mt-5 max-w-lg">
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-[var(--ancra-accent)] shadow-[0_0_10px_var(--ancra-accent-glow)]" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div className="mt-2 font-mono text-[10px] text-ancr-mute">{p.progress}% of concentration</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16 ancr-card p-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-[var(--ancra-accent)]" />
          <div className="ancr-label">AIAH™ · reading your arc</div>
        </div>
        <p className="font-serif text-2xl leading-snug text-ancr-dim">
          Your concentration is on pace. The delta between you and Cohort 07's median is +6 on portfolio and +11 on collaboration hours. Your next unlock is the Portfolio Panel — spend the next two weeks tightening three mixes and finalising two lyric drafts.
        </p>
      </div>
    </div>
  );
}
