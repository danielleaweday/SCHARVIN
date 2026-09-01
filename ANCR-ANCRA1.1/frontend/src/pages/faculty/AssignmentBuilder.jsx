import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles, Upload, Users, Calendar as CalendarIcon } from "lucide-react";

export default function AssignmentBuilder() {
  const [kind, setKind] = React.useState("recording");
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Assignment Builder"
        title={<span><em className="italic text-ancr-dim">Design</em> a working brief</span>}
        sub="Assignments in ANCRA™ are not worksheets. They are creative briefs — with a deliverable, a rubric, ecosystem tools, and an intended outcome."
        right={<button className="ancr-btn ancr-btn-primary">Assign to cohort</button>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="ancr-card p-6">
            <div className="ancr-label mb-3">Brief</div>
            <input defaultValue="First-eight — melodic sketch" className="w-full bg-transparent font-serif text-3xl outline-none border-b border-white/[0.06] focus:border-white/25 pb-2" />
            <textarea rows={4} defaultValue="Write the first eight bars of a new song. Your goal is not completion — it is to establish the emotional contract of the record. Submit a working audio sketch (voice+piano is fine) and a one-paragraph reflection." className="mt-4 w-full resize-none bg-transparent text-[15px] leading-relaxed text-ancr-dim outline-none" />
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Kind</div>
            <div className="flex flex-wrap gap-2">
              {["recording", "writing", "production", "performance", "reflection", "peer review", "portfolio"].map((k) => (
                <button
                  key={k}
                  data-testid={`kind-${k.replace(/\s/g, "-")}`}
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                    kind === k ? "border-white bg-white text-black" : "border-white/10 text-ancr-dim hover:border-white/30 hover:text-white"
                  }`}
                >{k}</button>
              ))}
            </div>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Deliverable</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="ancr-label mb-2">Audio</div>
                <div className="flex items-center gap-2"><Upload size={13} /><span className="text-[13px]">Uploads via ANCRLAB™</span></div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="ancr-label mb-2">Reflection</div>
                <div className="text-[13px] text-ancr-dim">200 words minimum</div>
              </div>
            </div>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Ecosystem outs</div>
            <div className="flex flex-wrap gap-2">
              <Chip tone="accent">ANCRLAB™ · session</Chip>
              <Chip>ANCRSync™ · peer critique</Chip>
              <Chip>INHEIRA™ · register</Chip>
              <Chip>COHEIR™ · office-hour ready</Chip>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Scheduling</div>
            <div className="space-y-3 font-mono text-[12px]">
              <Row k="Assigned" v="Cohort 07 · 24 students" />
              <Row k="Released" v="Today · 09:00" />
              <Row k="Due" v="Feb 14 · 18:00" />
              <Row k="Peer review closes" v="Feb 16" />
            </div>
          </div>

          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ Rubric Draft</div>
            </div>
            <ul className="space-y-2 text-[12.5px] leading-relaxed text-ancr-dim">
              <li>· Emotional contract (30%) — is the first phrase load-bearing?</li>
              <li>· Prosody (25%) — vowel stress, breath, motif</li>
              <li>· Melodic Kernel (25%) — replayable idea</li>
              <li>· Reflection (20%) — self-awareness of choice</li>
            </ul>
            <button className="ancr-btn ancr-btn-ghost mt-4 text-[10px] py-1.5 px-3">Open in Rubrics</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-b-0">
      <div className="ancr-label">{k}</div>
      <div className="text-[12px] text-ancr-dim">{v}</div>
    </div>
  );
}
