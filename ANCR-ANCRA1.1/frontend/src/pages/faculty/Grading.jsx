import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Play, Sparkles, Send } from "lucide-react";

const SUBMISSIONS = [
  { id: "s1", student: "Maya Ellis", title: "First Eight — melodic sketch", when: "12m", status: "in_review", audio: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: "s2", student: "Ava Reyes", title: "First Eight — melodic sketch", when: "38m", status: "in_review", audio: true, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: "s3", student: "Noah King", title: "First Eight — melodic sketch", when: "2h", status: "graded", grade: 88, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop" },
  { id: "s4", student: "Lena Park", title: "First Eight — melodic sketch", when: "3h", status: "in_review", audio: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
];

const RUBRIC = [
  { c: "Emotional Contract", weight: 30, score: 26 },
  { c: "Prosody", weight: 25, score: 22 },
  { c: "Melodic Kernel", weight: 25, score: 20 },
  { c: "Reflection", weight: 20, score: 17 },
];

export default function Grading() {
  const [active, setActive] = React.useState(SUBMISSIONS[0].id);
  const sub = SUBMISSIONS.find((s) => s.id === active);
  const total = RUBRIC.reduce((a, r) => a + r.score, 0);

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Grading"
        title={<span><em className="italic text-ancr-dim">Signal-forward</em> assessment</span>}
        sub="Not a gradebook. A signed, cinematic assessment surface — every score attached to a rubric, every note attached to a timestamp."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Submissions */}
        <aside className="lg:col-span-3 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="ancr-label">Submissions · {SUBMISSIONS.length}</div>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {SUBMISSIONS.map((s) => (
              <button
                key={s.id}
                data-testid={`sub-${s.id}`}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active === s.id ? "bg-white/[0.06]" : "hover:bg-white/[0.02]"}`}
              >
                <img src={s.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[13px]">{s.student}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-ancr-mute">{s.when}</div>
                </div>
                {s.status === "graded"
                  ? <div className="font-mono text-[13px]">{s.grade}</div>
                  : <div className="h-1.5 w-1.5 rounded-full bg-[var(--ancra-accent)]" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Player + rubric */}
        <div className="lg:col-span-6 space-y-4">
          <div className="ancr-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <div className="ancr-label">{sub.student}</div>
              <div className="mt-1 font-serif text-2xl">{sub.title}</div>
            </div>

            {/* Audio player mock */}
            <div className="relative aspect-video border-b border-white/[0.06]">
              <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop" className="absolute inset-0 h-full w-full object-cover opacity-50" alt="" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur"><Play size={20} className="fill-white text-white" /></div>
              </div>
              {/* Waveform */}
              <div className="absolute inset-x-0 bottom-0 flex h-16 items-end gap-[2px] p-3">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="w-full flex-1 rounded-t bg-white/50" style={{ height: `${20 + Math.sin(i / 3) * 20 + Math.random() * 30}%` }} />
                ))}
              </div>
            </div>

            {/* Rubric */}
            <div className="p-6">
              <div className="ancr-label mb-4">Rubric · Signed Assessment</div>
              <div className="space-y-3">
                {RUBRIC.map((r) => (
                  <div key={r.c}>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>{r.c}</span>
                      <span><span className="text-white">{r.score}</span><span className="text-ancr-mute"> / {r.weight}</span></span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full bg-white" style={{ width: `${(r.score / r.weight) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-baseline justify-between border-t border-white/[0.06] pt-4">
                <div className="ancr-label">Total</div>
                <div className="font-serif text-4xl">{total}<span className="text-ancr-mute text-xl">/100</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback + AI */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ feedback draft</div>
            </div>
            <p className="text-[13px] leading-relaxed text-ancr-dim">
              The melodic kernel at 0:14 is strong and repayable. Consider tightening the prosody on the second phrase — the vowel drops the emotional load right before the resolution.
            </p>
            <button className="ancr-btn ancr-btn-ghost mt-3 text-[10px] py-1.5 px-3">Use as starting point</button>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-3">Your notes</div>
            <textarea rows={6} defaultValue="Lovely melodic kernel — very playable. Let's tighten prosody in the chorus and try inverting the interval on 'gone'." className="w-full resize-none rounded-lg border border-white/[0.06] bg-black/40 p-3 text-[13px] outline-none placeholder:text-ancr-mute focus:border-white/25" />
            <button className="ancr-btn ancr-btn-primary mt-3 text-[10px] py-1.5 px-3"><Send size={11} /> Sign & Return</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
