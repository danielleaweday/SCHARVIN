import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles, Wand2, Loader2 } from "lucide-react";

const SUGGESTED = [
  { week: "Week 1", block: "Cinematic Lesson · Foundations of Voice", kind: "video" },
  { week: "Week 1", block: "Assignment · 30 seconds of you", kind: "assignment" },
  { week: "Week 2", block: "Master Session™ · Warm-up ritual", kind: "master" },
  { week: "Week 2", block: "ANCRLAB™ Session · Record a scale", kind: "ancrlab" },
  { week: "Week 3", block: "Peer Critique · Timbre exploration", kind: "peer" },
  { week: "Week 3", block: "Portfolio Deliverable · Voice Signature", kind: "portfolio" },
];

export default function AICourseBuilder() {
  const [prompt, setPrompt] = React.useState("A 6-week Studio Experience™ for sophomores concentrating in Performance, focused on developing a unique voice signature.");
  const [generated, setGenerated] = React.useState(true);
  const [running, setRunning] = React.useState(false);

  const generate = () => {
    setGenerated(false);
    setRunning(true);
    setTimeout(() => { setRunning(false); setGenerated(true); }, 1400);
  };

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="AI Course Builder"
        title={<span><em className="italic text-ancr-dim">Draft</em> a Studio Experience™ in seconds</span>}
        sub="Describe the intent — AIAH scaffolds the weeks, lessons, assignments, master sessions, and ecosystem outs. You keep authorship. AIAH just gets you to the first draft."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">Describe the arc</div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              data-testid="course-brief"
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-[14px] leading-relaxed outline-none focus:border-white/25"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {["6 weeks", "Performance", "Sophomore", "Cinematic", "INHEIRA outputs", "Master session · guest"].map((c) => (
                <Chip key={c} tone="accent">{c}</Chip>
              ))}
            </div>
            <button
              onClick={generate}
              data-testid="course-generate"
              className="ancr-btn ancr-btn-primary mt-6"
            >
              {running ? <><Loader2 size={12} className="animate-spin" /> Composing</> : <><Wand2 size={12} /> Compose draft</>}
            </button>
          </div>

          <div className="ancr-card p-6 mt-4">
            <div className="ancr-label mb-3">AIAH principles</div>
            <ul className="space-y-2 text-[12.5px] leading-relaxed text-ancr-dim">
              <li>· No filler. Every block leads somewhere in the ecosystem.</li>
              <li>· Balance intake (video/reading) and output (recording/assignment).</li>
              <li>· A Master Session™ every 2 weeks minimum.</li>
              <li>· A portfolio deliverable in every arc.</li>
            </ul>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-7">
          <div className="ancr-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <div className="ancr-label">Draft output</div>
                <div className="mt-1 font-serif text-2xl">The Voice Signature</div>
              </div>
              {generated && (
                <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Send to Builder</button>
              )}
            </div>

            {running && (
              <div className="p-14 text-center">
                <Loader2 size={22} className="animate-spin mx-auto text-ancr-dim" />
                <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-ancr-mute">Reasoning across the ecosystem…</div>
              </div>
            )}

            {generated && !running && (
              <div className="divide-y divide-white/[0.05]">
                {SUGGESTED.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02]">
                    <div className="ancr-label w-16">{s.week}</div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex-1 text-[13.5px]">{s.block}</div>
                    <Chip>{s.kind}</Chip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
