import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { Music, Zap, ArrowUpRight } from "lucide-react";

const STATUS = ["locked", "writing", "demo", "recorded", "mixed", "mastered", "released"];
const STATUS_LABEL = {
  locked: "Not Started",
  writing: "Writing",
  demo: "Demo",
  recorded: "Recorded",
  mixed: "Mixed",
  mastered: "Mastered",
  released: "Released",
};

export default function ThirtySong() {
  const { data } = useSWR("/student/songs", get);
  const songs = data?.songs || [];
  const counts = STATUS.reduce((a, s) => ({ ...a, [s]: songs.filter((x) => x.status === s).length }), {});
  const done = counts.released + counts.mastered + counts.mixed;

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="30 Song Progress™"
        title={<span><em className="italic text-ancr-dim">The</em> signature capstone of the CCDP</span>}
        sub="Every student writes, records, and evolves thirty original songs across their journey. Each song is registered in INHEIRA™, refined in ANCRLAB™, and released through ANCRWAV™."
      />

      {/* Header stat row */}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-7">
        <div className="ancr-card col-span-2 md:col-span-2 p-6">
          <div className="ancr-label">Complete</div>
          <div className="mt-3 font-serif text-6xl tracking-tight">{done}<span className="text-ancr-mute">/30</span></div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-white" style={{ width: `${(done / 30) * 100}%` }} />
          </div>
        </div>
        {STATUS.map((s) => (
          <div key={s} className="ancr-card p-4">
            <div className="ancr-label truncate">{STATUS_LABEL[s]}</div>
            <div className="mt-3 font-mono text-2xl">{counts[s] || 0}</div>
          </div>
        ))}
      </div>

      {/* Song grid */}
      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {songs.map((s) => (
          <SongCard key={s.id} song={s} />
        ))}
      </div>
    </div>
  );
}

function SongCard({ song }) {
  const isDone = ["mixed", "mastered", "released"].includes(song.status);
  return (
    <div className="ancr-card group relative overflow-hidden p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-ancr-mute">#{String(song.number).padStart(2, "0")}</div>
          <div className="mt-2 font-serif text-lg leading-tight">{song.title}</div>
        </div>
        <div className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
          song.status === "released" ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/[0.08]" :
          isDone                     ? "border-white/30 text-white bg-white/[0.06]" :
          song.status === "locked"   ? "border-white/10 text-ancr-mute" :
                                       "border-white/15 text-ancr-dim"
        }`}>
          {STATUS_LABEL[song.status]}
        </div>
      </div>
      {song.co_writers?.length > 0 && (
        <div className="mt-3 font-mono text-[10px] text-ancr-mute">Co-writer · {song.co_writers.join(", ")}</div>
      )}
      <div className="mt-4 flex items-center gap-1.5">
        {song.inheira_registered && <span title="INHEIRA registered" className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-ancr-dim">INHEIRA™</span>}
        {song.vaulta_royalty_active && <span title="Vaulta active" className="rounded border border-emerald-400/40 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300 bg-emerald-500/[0.06]">Vaulta™</span>}
      </div>
    </div>
  );
}
