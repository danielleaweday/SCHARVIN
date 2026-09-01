import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Chip } from "@/components/common/Primitives";
import { Play, Pause, ArrowUpRight, MessageSquare, Bookmark, Share2, ChevronRight } from "lucide-react";

export default function LessonPlayer() {
  const { id } = useParams();
  const { data: lesson } = useSWR(`/student/lesson/${id}`, get);
  const [playing, setPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);

  if (!lesson) return <div className="p-10 font-mono text-[12px] text-ancr-mute">Loading lesson…</div>;

  return (
    <div className="ancr-reveal grid grid-cols-1 gap-8 px-6 md:px-10 py-8 xl:grid-cols-12">
      {/* Player */}
      <div className="xl:col-span-8">
        <div className="ancr-label mb-3">
          Lesson · Chapter {lesson.chapter} · {lesson.duration}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.02] tracking-tight max-w-3xl">
          {lesson.title}
        </h1>
        <div className="mt-3 font-mono text-[11px] text-ancr-dim">Taught by {lesson.instructor}</div>

        {/* Cinematic video frame */}
        <div className="ancr-scan mt-6 relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <img src={lesson.video_poster} alt="" className={`h-full w-full object-cover transition-all ${playing ? "scale-[1.02] opacity-90" : "opacity-70"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              data-testid="lesson-play"
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md transition-all group-hover:scale-105 group-hover:border-white group-hover:ancr-accent-glow">
                <Play size={30} className="fill-white text-white translate-x-0.5" />
              </div>
            </button>
          )}

          {playing && (
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
                <button onClick={() => setPlaying(false)} className="rounded-full bg-white p-2 text-black"><Pause size={14} /></button>
                <div className="flex-1">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-white transition-all" style={{ width: `${(currentChapter + 1) * 18}%` }} />
                  </div>
                </div>
                <div className="font-mono text-[11px] text-white/80">{lesson.chapters?.[currentChapter]?.t || "00:00"} / {lesson.duration}</div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="ancr-btn ancr-btn-ghost" data-testid="lesson-bookmark"><Bookmark size={12} /> Bookmark</button>
          <button className="ancr-btn ancr-btn-ghost"><MessageSquare size={12} /> Discussion</button>
          <button className="ancr-btn ancr-btn-ghost"><Share2 size={12} /> Share</button>
          <div className="flex-1" />
          <Link to="/hub/ANCRLAB" className="ancr-btn ancr-btn-accent" data-testid="lesson-open-ancrlab">
            Open in ANCRLAB™ <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Summary */}
        <section className="mt-10">
          <div className="ancr-label mb-3">The Idea</div>
          <p className="font-serif text-2xl leading-snug tracking-tight text-ancr-dim">
            {lesson.summary || "This lesson unpacks a core creative principle used by working artists at the highest level. Every idea here is designed to be applied — not merely understood."}
          </p>
        </section>

        {/* Next ecosystem actions */}
        {lesson.next_actions && (
          <section className="mt-10">
            <div className="ancr-label mb-4">Continue the journey</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {lesson.next_actions.map((a) => (
                <Link
                  key={a.label}
                  to={`/hub/${a.module}`}
                  data-testid={`next-action-${a.module}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="ancr-label mb-1">{a.module}™</div>
                    <div className="text-[13px]">{a.label}</div>
                  </div>
                  <ChevronRight size={16} className="text-ancr-dim transition group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Chapters + resources */}
      <aside className="xl:col-span-4 space-y-6">
        <div className="ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="ancr-label">Chapters</div>
          </div>
          <div className="p-2">
            {(lesson.chapters || []).map((c, i) => (
              <button
                key={i}
                onClick={() => setCurrentChapter(i)}
                data-testid={`chapter-${i}`}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  i === currentChapter ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className={`font-mono text-[11px] tracking-wider w-12 ${i === currentChapter ? "text-white" : "text-ancr-mute"}`}>{c.t}</div>
                <div className="flex-1 text-[13px]">{c.title}</div>
                {i === currentChapter && <div className="h-1.5 w-1.5 rounded-full bg-[var(--ancra-accent)] shadow-[0_0_8px_var(--ancra-accent-glow)]" />}
              </button>
            ))}
            {!lesson.chapters?.length && <div className="p-4 font-mono text-[11px] text-ancr-mute">No chapter data yet.</div>}
          </div>
        </div>

        {lesson.resources && (
          <div className="ancr-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="ancr-label">Resources</div>
            </div>
            <div className="p-2">
              {lesson.resources.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ancr-dim">{r.kind}</div>
                    <div className="text-[13px]">{r.title}</div>
                  </div>
                  <ArrowUpRight size={13} className="text-ancr-dim" />
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
