import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { GripVertical, Plus, Sparkles, Video, Users, FileText, Mic, Layers, BookOpen } from "lucide-react";

const MODULES = [
  { id: "m1", title: "Week 1 · Foundations", lessons: 3, assignments: 1, status: "published" },
  { id: "m2", title: "Week 2 · The First Eight", lessons: 4, assignments: 2, status: "draft" },
  { id: "m3", title: "Week 3 · Prosody & Chorus", lessons: 3, assignments: 2, status: "draft" },
  { id: "m4", title: "Week 4 · Building the Bridge", lessons: 2, assignments: 1, status: "locked" },
  { id: "m5", title: "Week 5 · Master Session (Sylvia Massy)", lessons: 1, assignments: 0, status: "draft" },
  { id: "m6", title: "Week 6 · Portfolio Panel", lessons: 0, assignments: 1, status: "locked" },
];

export default function StudioExperienceBuilder() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Studio Experience™ Builder"
        title={<span><em className="italic text-ancr-dim">Author</em> the arc, week by week</span>}
        sub="This is the top-level composition surface. Weeks, lessons, assignments, and industry sessions live here — a Notion-density canvas with cinematic outputs."
        right={<div className="flex gap-2">
          <button className="ancr-btn ancr-btn-ghost">Preview student view</button>
          <button className="ancr-btn ancr-btn-primary">Publish</button>
        </div>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Palette */}
        <aside className="lg:col-span-3 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="ancr-label">Blocks</div>
          </div>
          <div className="space-y-2 p-3">
            {[
              { icon: Video, label: "Cinematic Lesson" },
              { icon: FileText, label: "Reading" },
              { icon: Layers, label: "ANCRLAB™ Session" },
              { icon: Users, label: "ANCRSync™ Room" },
              { icon: Mic, label: "Master Session™" },
              { icon: BookOpen, label: "Assignment Brief" },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} data-testid={`se-block-${b.label.toLowerCase().replace(/[^a-z]/g, "-")}`} className="group flex cursor-grab items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/20">
                  <div className="rounded border border-white/10 p-1.5"><Icon size={13} /></div>
                  <div className="text-[12.5px]">{b.label}</div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <section className="ancr-grid-bg lg:col-span-6 min-h-[70vh] rounded-2xl border border-white/[0.06] bg-black/40 p-5">
          <div className="mb-4">
            <div className="ancr-label">Composition</div>
            <input defaultValue="Songwriting Architecture" className="mt-1 w-full bg-transparent font-serif text-3xl outline-none" />
            <div className="mt-1 font-mono text-[10px] text-ancr-mute">Semester 3 · 12 weeks · Cohort 07</div>
          </div>

          <div className="space-y-2">
            {MODULES.map((m, i) => (
              <div key={m.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-white/25 transition">
                <GripVertical size={14} className="text-ancr-mute" />
                <div className="font-mono text-[10px] text-ancr-mute w-8">{String(i + 1).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[15px]">{m.title}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">
                    {m.lessons} lessons · {m.assignments} assignments
                  </div>
                </div>
                <Chip tone={m.status === "published" ? "success" : m.status === "draft" ? "warn" : "default"}>{m.status}</Chip>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 p-6 font-mono text-[10px] uppercase tracking-widest text-ancr-mute">
              <Plus size={12} className="mr-2" /> Drag a block here to add a week
            </div>
          </div>
        </section>

        {/* AI panel */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ suggests</div>
            </div>
            <div className="space-y-3 text-[13px] leading-relaxed text-ancr-dim">
              <div>· Week 4 has no peer critique — students plateau here in Cohort 06.</div>
              <div>· Consider a mid-arc Portfolio Sync™ between Week 6 and 7.</div>
              <div>· Add an INHEIRA™ registration checkpoint at Week 8.</div>
            </div>
            <button className="ancr-btn ancr-btn-primary mt-4 text-[10px] py-1.5 px-3">Apply all</button>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-3">Rollup</div>
            <div className="space-y-2 font-mono text-[11px]">
              <Row k="Total lessons" v="13" />
              <Row k="Assignments" v="7" />
              <Row k="Master Sessions" v="2" />
              <Row k="Est. hours" v="46h" />
            </div>
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
      <div className="text-ancr-dim">{v}</div>
    </div>
  );
}
