import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Video, Upload, Sparkles, Plus, Type, ListChecks, FileText } from "lucide-react";

export default function LessonBuilder() {
  const [chapters, setChapters] = React.useState([
    { t: "00:00", title: "Opening — The Emotional Contract" },
    { t: "04:12", title: "Case Study · 'Landslide'" },
    { t: "09:44", title: "Case Study · Frank Ocean" },
    { t: "14:20", title: "Melodic Kernel" },
  ]);

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Lesson Builder"
        title={<span><em className="italic text-ancr-dim">Compose</em> a cinematic lesson</span>}
        sub="Not slides. Not documents. A cinematic learning surface with chaptered video, live resources, ecosystem action outs, and an AIAH transcript companion."
        right={<button className="ancr-btn ancr-btn-primary">Publish to Studio Experience™</button>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: composer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Title + intro */}
          <div className="ancr-card p-6">
            <div className="ancr-label mb-3">Lesson title</div>
            <input defaultValue="The First Eight Bars" className="w-full bg-transparent font-serif text-4xl outline-none border-b border-white/[0.06] focus:border-white/25 pb-2" />
            <textarea rows={2} placeholder="Add a cinematic subtitle…" defaultValue="Why the first eight bars carry the emotional contract of the entire record." className="mt-4 w-full resize-none bg-transparent font-serif italic text-lg text-ancr-dim outline-none" />
          </div>

          {/* Video */}
          <div className="ancr-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="ancr-label">Video</div>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><Upload size={11} /> Upload</button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-black">
              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&h=1080&fit=crop" className="absolute inset-0 h-full w-full object-cover opacity-70" alt="" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur"><Video size={20} /></div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="ancr-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="ancr-label">Chapters</div>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><Plus size={11} /> Add</button>
            </div>
            <div className="space-y-2">
              {chapters.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <input defaultValue={c.t} className="w-16 bg-transparent font-mono text-[11px] outline-none border-b border-white/[0.06]" />
                  <input defaultValue={c.title} className="flex-1 bg-transparent text-[13px] outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Blocks */}
          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Content blocks</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Type, label: "Text" },
                { icon: FileText, label: "Interactive PDF" },
                { icon: Video, label: "Video insert" },
                { icon: ListChecks, label: "Reflection" },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <button key={b.label} data-testid={`add-block-${b.label.toLowerCase().replace(/\s/g, "-")}`} className="ancr-card flex flex-col items-center gap-2 p-4 hover:border-white/25 transition">
                    <Icon size={16} />
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ancr-dim">{b.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AIAH + settings */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ Assist</div>
            </div>
            <div className="space-y-2 text-[13px] leading-relaxed text-ancr-dim">
              <div>Auto-transcribe when video is uploaded.</div>
              <div>Suggest chapter titles from the transcript.</div>
              <div>Generate discussion prompts.</div>
              <div>Draft an assignment brief from this lesson.</div>
            </div>
            <button className="ancr-btn ancr-btn-primary mt-4 text-[10px] py-1.5 px-3">Run AIAH assist</button>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-4">Settings</div>
            <Row k="Kind" v="Video · Master Session™" />
            <Row k="Duration" v="24 min" />
            <Row k="Belongs to" v="Songwriting Architecture" />
            <Row k="Visibility" v="Cohort 07" />
            <Row k="Ecosystem outs" v="ANCRLAB · INHEIRA · COHEIR" />
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
