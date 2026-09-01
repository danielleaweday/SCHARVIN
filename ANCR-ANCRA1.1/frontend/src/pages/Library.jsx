import React from "react";
import { Section } from "@/components/common/Primitives";
import { BookOpen, FileText, Video, Music } from "lucide-react";

const RESOURCES = [
  { icon: Video, kind: "Video", title: "Building Your First Palette", author: "Lucas Neri", when: "18m" },
  { icon: FileText, kind: "PDF", title: "The Grammar of Melody · Chapter 4", author: "T. Bloom", when: "10p" },
  { icon: Music, kind: "Audio", title: "Prosody in Contemporary Songwriting", author: "Master Session", when: "42m" },
  { icon: BookOpen, kind: "Read", title: "Understanding Publishing Splits", author: "Ivy Marsh", when: "12m read" },
];

export default function Library() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Library" title={<span><em className="italic text-ancr-dim">The</em> ANCR shelf</span>} />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {RESOURCES.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="ancr-card group p-6 hover:border-white/20 transition">
              <div className="flex items-center justify-between">
                <div className="rounded-full border border-white/10 p-2"><Icon size={14} /></div>
                <div className="ancr-label">{r.kind}</div>
              </div>
              <div className="mt-6 font-serif text-lg leading-tight">{r.title}</div>
              <div className="mt-3 font-mono text-[11px] text-ancr-dim">{r.author} · {r.when}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
