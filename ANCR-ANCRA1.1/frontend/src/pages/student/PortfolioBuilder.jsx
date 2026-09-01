import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { GripVertical, Plus, Sparkles, Eye, Music, Video, FileText } from "lucide-react";

const AVAILABLE = [
  { id: "a1", title: "Cathedral in July", kind: "Master", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", score: 92 },
  { id: "a2", title: "Half-Light Room", kind: "Master", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop", score: 89 },
  { id: "a3", title: "Say Less", kind: "Mix", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", score: 84 },
  { id: "a4", title: "Live from Studio B", kind: "Performance", cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=400&fit=crop", score: 91 },
  { id: "a5", title: "Blue Hour", kind: "Song", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop", score: 86 },
  { id: "a6", title: "Every Small Rebellion", kind: "Lyric", cover: "https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=400&h=400&fit=crop", score: 79 },
];

const KIND_ICON = { Master: Music, Mix: Music, Performance: Video, Song: Music, Lyric: FileText };

export default function PortfolioBuilder() {
  const [selected, setSelected] = React.useState(["a1", "a3", "a4", "a2"]);
  const picked = selected.map((id) => AVAILABLE.find((a) => a.id === id));
  const remaining = AVAILABLE.filter((a) => !selected.includes(a.id));

  const toggle = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Portfolio Builder"
        title={<span><em className="italic text-ancr-dim">Compose</em> your portfolio</span>}
        sub="Assemble a signed portfolio that travels across ANCRID™ Creator Passport and ANCRLaunch™ readiness. Drag to reorder, click to add or remove."
        right={<button className="ancr-btn ancr-btn-primary">Save & Sign</button>}
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: catalog */}
        <div className="lg:col-span-4 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
            <div className="ancr-label">Reviewed work</div>
            <div className="font-mono text-[10px] text-ancr-mute">{remaining.length} available</div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {remaining.map((w) => {
              const Icon = KIND_ICON[w.kind] || Music;
              return (
                <button
                  key={w.id}
                  onClick={() => toggle(w.id)}
                  data-testid={`portfolio-add-${w.id}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-white/[0.06] transition hover:border-white/25"
                >
                  <img src={w.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-90 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-between p-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <Icon size={11} className="text-white" />
                      <div className="font-mono text-[10px] text-white">{w.score}</div>
                    </div>
                    <div>
                      <div className="font-serif text-[13px] leading-tight">{w.title}</div>
                      <div className="mt-1 font-mono text-[9px] text-white/60 uppercase tracking-wider">{w.kind}</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                      <Plus size={22} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: composition */}
        <div className="lg:col-span-5">
          <div className="ancr-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
              <div className="ancr-label">Composition · Booking Packet v2</div>
              <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><Eye size={11} /> Preview</button>
            </div>
            <div className="ancr-grid-bg min-h-[520px] p-4 space-y-2">
              {picked.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/40 p-3">
                  <GripVertical size={14} className="text-ancr-mute" />
                  <div className="font-mono text-[10px] text-ancr-mute w-8">{String(i + 1).padStart(2, "0")}</div>
                  <img src={w.cover} alt="" className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1">
                    <div className="font-serif text-[15px]">{w.title}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">{w.kind}</div>
                  </div>
                  <div className="font-mono text-[13px]">{w.score}</div>
                  <button onClick={() => toggle(w.id)} className="rounded-full border border-white/10 p-1.5 text-ancr-dim hover:text-white hover:border-white/30">
                    ×
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 p-6 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">
                <Plus size={12} className="mr-2" /> Drop reviewed work here
              </div>
            </div>
          </div>
        </div>

        {/* Right: AIAH suggestion + meta */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="ancr-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ Suggestion</div>
            </div>
            <div className="text-[13px] leading-relaxed text-ancr-dim">
              Your current set leans master-heavy. Adding one lyric-forward piece would strengthen the writer identity for publishing sub-audiences.
            </div>
            <button className="ancr-btn ancr-btn-ghost mt-3 text-[10px] py-1.5 px-3">Insert 'Every Small Rebellion'</button>
          </div>

          <div className="ancr-card p-5">
            <div className="ancr-label mb-3">Composition Score</div>
            <div className="font-mono text-4xl tracking-tight">87</div>
            <div className="mt-2 font-mono text-[10px] text-ancr-mute">Weighted avg · portfolio</div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-[var(--ancra-accent)]" style={{ width: `87%` }} />
            </div>
          </div>

          <div className="ancr-card p-5">
            <div className="ancr-label mb-3">Sync targets</div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between"><span>ANCRID™ Passport</span><Chip tone="success">ready</Chip></div>
              <div className="flex items-center justify-between"><span>ANCRLaunch™ Resume</span><Chip>2 changes</Chip></div>
              <div className="flex items-center justify-between"><span>Booking Packet™</span><Chip>v2 draft</Chip></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
