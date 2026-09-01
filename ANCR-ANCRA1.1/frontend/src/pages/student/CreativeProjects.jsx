import React from "react";
import { Link } from "react-router-dom";
import { Section, Chip } from "@/components/common/Primitives";
import { ArrowUpRight, Layers, Users, Play } from "lucide-react";

const PROJECTS = [
  { id: "p1", title: "Cathedral in July · Master v3", kind: "Song", module: "ANCRLAB", collabs: 2, updated: "2h ago", progress: 82,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop" },
  { id: "p2", title: "Compilation EP · Winter", kind: "EP", module: "ANCRLAB", collabs: 5, updated: "yesterday", progress: 41,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop" },
  { id: "p3", title: "Live Recording · Studio B set", kind: "Performance", module: "ANCRVIEW", collabs: 3, updated: "3d ago", progress: 66,
    cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=800&fit=crop" },
  { id: "p4", title: "Sound Design Palette · Winter", kind: "Palette", module: "ANCRLAB", collabs: 1, updated: "1w", progress: 28,
    cover: "https://images.unsplash.com/photo-1574517947730-55cb23e608c2?w=1200&h=800&fit=crop" },
];

export default function CreativeProjects() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Creative Projects"
        title={<span><em className="italic text-ancr-dim">Every</em> piece of work you're building</span>}
        sub="Projects thread across ANCRLAB™, ANCRSync™, INHEIRA™, and ANCRVIEW™. Move fluidly — the ecosystem stays in sync."
        right={<button className="ancr-btn ancr-btn-primary">New Project</button>}
      />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {PROJECTS.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.08]">
            <img src={p.cover} alt="" className="h-64 w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex items-center gap-2">
                <Chip tone="accent">{p.kind}</Chip>
                <Chip>{p.module}™</Chip>
              </div>
              <div>
                <div className="font-serif text-2xl leading-tight">{p.title}</div>
                <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-ancr-dim">
                  <span><Users size={11} className="inline mr-1 -mt-0.5" />{p.collabs} collaborators</span>
                  <span>·</span>
                  <span>Updated {p.updated}</span>
                </div>
                <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-[var(--ancra-accent)] shadow-[0_0_10px_var(--ancra-accent-glow)]" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3"><Play size={11} className="fill-black" /> Continue</button>
                  <Link to={`/hub/${p.module}`} className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Open in {p.module}™ <ArrowUpRight size={11} /></Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
