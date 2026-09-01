import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section } from "@/components/common/Primitives";
import { GripVertical, Plus, Video, FileText, Users, Mic, Layers, Sparkles } from "lucide-react";

const BLOCKS = [
  { id: "b1", kind: "video", icon: Video, title: "Cinematic Lecture · 24 min", subtitle: "Chapters + AIAH transcript" },
  { id: "b2", kind: "ancrlab", icon: Layers, title: "ANCRLAB™ Session · Stem Build", subtitle: "Student uploads stems" },
  { id: "b3", kind: "writing", icon: FileText, title: "Writing Exercise", subtitle: "500 words · peer review" },
  { id: "b4", kind: "collab", icon: Users, title: "ANCRSync™ Writing Room", subtitle: "Cross-cohort, 3 seats" },
  { id: "b5", kind: "master", icon: Mic, title: "Master Session™ · Industry", subtitle: "Recorded to ANCRVIEW™" },
];

const INITIAL_CANVAS = [
  { id: "c1", kind: "video", title: "Opening — Emotional Contract", block: "b1" },
  { id: "c2", kind: "writing", title: "First-eight melodic sketch", block: "b3" },
  { id: "c3", kind: "ancrlab", title: "Build the palette (12 patches)", block: "b2" },
  { id: "c4", kind: "collab", title: "Nightshift · Writing Room 03", block: "b4" },
];

const BLOCK_META = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

export default function CurriculumBuilder() {
  const { data } = useSWR("/faculty/curriculum", get);
  const [canvas, setCanvas] = React.useState(INITIAL_CANVAS);
  const [dragging, setDragging] = React.useState(null);

  const onDropOnCanvas = (e) => {
    e.preventDefault();
    if (!dragging) return;
    if (dragging.kind === "palette") {
      setCanvas((c) => [...c, { id: "c" + (c.length + 1), kind: dragging.block.kind, title: `New · ${dragging.block.title}`, block: dragging.block.id }]);
    } else if (dragging.kind === "canvas-reorder") {
      // simple noop drop area — reorder is handled below
    }
    setDragging(null);
  };

  const onCanvasItemDrop = (targetIdx) => (e) => {
    e.preventDefault();
    if (dragging?.kind !== "canvas-reorder") return;
    setCanvas((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragging.idx, 1);
      arr.splice(targetIdx, 0, moved);
      return arr;
    });
    setDragging(null);
  };

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Curriculum Builder"
        title={<span><em className="italic text-ancr-dim">Compose</em> a Studio Experience™</span>}
        sub="Drag blocks from the palette into the composition. Each block is native to the ecosystem — ANCRLAB™ sessions, ANCRSync™ rooms, Master Sessions™."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Palette */}
        <aside className="lg:col-span-3 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="ancr-label">Block Palette</div>
          </div>
          <div className="space-y-2 p-3">
            {BLOCKS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={() => setDragging({ kind: "palette", block: b })}
                  data-testid={`palette-${b.id}`}
                  className="group flex cursor-grab items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 active:cursor-grabbing hover:border-white/20"
                >
                  <div className="rounded-md border border-white/10 p-2 text-ancr-dim group-hover:text-white">
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-tight">{b.title}</div>
                    <div className="mt-1 font-mono text-[10px] text-ancr-mute">{b.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <section
          className="ancr-grid-bg lg:col-span-6 min-h-[70vh] rounded-2xl border border-white/[0.06] bg-black/40 p-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropOnCanvas}
          data-testid="canvas"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="ancr-label">Composition</div>
              <div className="mt-1 font-serif text-2xl">Songwriting Architecture · v2 draft</div>
            </div>
            <div className="font-mono text-[10px] text-ancr-mute uppercase tracking-wider">{canvas.length} blocks</div>
          </div>

          <div className="space-y-2">
            {canvas.map((c, i) => {
              const meta = BLOCK_META[c.block];
              const Icon = meta.icon;
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragging({ kind: "canvas-reorder", idx: i })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onCanvasItemDrop(i)}
                  data-testid={`canvas-block-${c.id}`}
                  className="group flex cursor-grab items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 active:cursor-grabbing hover:border-white/25"
                >
                  <GripVertical size={14} className="text-ancr-mute" />
                  <div className="font-mono text-[10px] text-ancr-mute w-8">{String(i + 1).padStart(2, "0")}</div>
                  <div className="rounded border border-white/10 p-1.5"><Icon size={13} /></div>
                  <div className="flex-1">
                    <div className="text-[13px]">{c.title}</div>
                    <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">{c.kind}</div>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 p-6 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">
              <Plus size={12} className="mr-2" /> Drop a block here
            </div>
          </div>
        </section>

        {/* Properties + AI */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="ancr-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="ancr-label">Properties</div>
            </div>
            <div className="space-y-4 p-5 font-mono text-[11px]">
              <PropRow k="Kind" v="Studio Experience™" />
              <PropRow k="Semester" v="3" />
              <PropRow k="Cohort" v="Fall 2025 · 07" />
              <PropRow k="Faculty" v="T. Bloom" />
              <PropRow k="Duration" v="12 weeks" />
              <PropRow k="Cohort size" v="18" />
            </div>
          </div>

          <div className="ancr-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ Assist</div>
            </div>
            <div className="text-[13px] leading-relaxed text-ancr-dim">
              Missing a peer-critique block after your writing exercise. Want me to add one?
            </div>
            <button className="ancr-btn ancr-btn-ghost mt-3 text-[10px] py-1.5 px-3">Add block</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PropRow({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-ancr-mute uppercase tracking-widest text-[9px]">{k}</div>
      <div className="text-white">{v}</div>
    </div>
  );
}
