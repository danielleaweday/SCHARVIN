import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { FileText, Video, Layers, BookOpen, Wrench, Sparkles } from "lucide-react";

const ICONS = { template: Layers, contract: FileText, video: Video, pdf: FileText,
  masterclass: Sparkles, course_material: BookOpen, slides: BookOpen, download: FileText,
  reference: Wrench, exercise: Sparkles };

export default function Library() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/resources").then(({ data }) => setItems(data)); }, []);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Resource Library</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Templates. Contracts. Masterclasses.</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => {
          const Icon = ICONS[r.kind] || FileText;
          return (
            <div key={r.id} className="glass-interactive p-0 overflow-hidden">
              <div className="h-32 relative">
                {r.cover_image && <img src={r.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <Icon className="absolute top-3 right-3 w-5 h-5 text-[#00F0FF]" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="wordmark text-white leading-tight">{r.title}</div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-zinc-400 text-xs line-clamp-2">{r.description}</div>
                <div className="flex items-center justify-between">
                  <RoleChip tone="violet">{r.kind.replace(/_/g, " ")}</RoleChip>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">by {r.uploaded_by_name}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
