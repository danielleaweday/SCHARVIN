import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { Play, Clock, ArrowUpRight, BookOpen, Users, Music } from "lucide-react";

export default function Experience() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useSWR(`/student/experience/${id}`, get);
  if (!data) return <div className="p-10 font-mono text-[12px] text-ancr-mute">Loading experience…</div>;
  const { experience: e, lessons } = data;

  return (
    <div className="ancr-reveal">
      {/* Cinematic hero */}
      <section className="relative h-[62vh] w-full overflow-hidden">
        <img src={e.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 flex items-end px-6 md:px-10 pb-10">
          <div className="max-w-3xl">
            <div className="ancr-label mb-3">{e.kind} · {e.tag}</div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
              {e.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Chip>{e.faculty}</Chip>
              <Chip>{e.duration}</Chip>
              <Chip tone="accent">{e.cohort_size} students</Chip>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => lessons?.[0] && nav(`/lesson/${lessons[0].id}`)}
                data-testid="continue-experience"
                className="ancr-btn ancr-btn-primary"
              >
                <Play size={12} className="fill-current" /> Continue
              </button>
              <Link to="/journey" className="ancr-btn ancr-btn-ghost">Back to journey</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="grid grid-cols-1 gap-10 px-6 md:px-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="ancr-label mb-3">About this experience</div>
          <p className="font-serif text-2xl leading-snug tracking-tight text-ancr-dim">
            {e.description}
          </p>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl">Lessons</h3>
              <span className="font-mono text-[10px] tracking-wider text-ancr-mute uppercase">
                {lessons.length} · {e.duration}
              </span>
            </div>
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {lessons.map((l, i) => (
                <Link
                  key={l.id}
                  to={`/lesson/${l.id}`}
                  data-testid={`lesson-row-${l.id}`}
                  className="group flex items-center gap-5 py-4 transition hover:bg-white/[0.02]"
                >
                  <div className="font-mono text-[11px] text-ancr-mute w-10">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg leading-tight">{l.title}</div>
                    <div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">
                      <span>{l.kind.replace("_", " ")}</span>
                      <span>·</span>
                      <span>{l.duration}</span>
                    </div>
                  </div>
                  <Play size={14} className="text-ancr-dim group-hover:text-white transition" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-4">
          <EcoLink icon={Music} label="ANCRLAB™" text="Open the stem pack for this experience" module="ANCRLAB" />
          <EcoLink icon={Users} label="ANCRSync™" text="Join the writing room for this cohort" module="ANCRSync" />
          <EcoLink icon={BookOpen} label="INHEIRA™" text="Register work created in this experience" module="INHEIRA" />

          <div className="ancr-card p-5">
            <div className="ancr-label mb-3">Progress</div>
            <div className="flex items-baseline gap-3">
              <div className="font-serif text-5xl tracking-tight">{e.progress}%</div>
              <div className="font-mono text-[10px] text-ancr-mute">of the arc</div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-[var(--ancra-accent)] transition-all" style={{ width: `${e.progress}%` }} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function EcoLink({ icon: Icon, label, text, module }) {
  return (
    <Link
      to={`/hub/${module}`}
      data-testid={`eco-link-${module}`}
      className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full border border-white/10 p-2.5">
          <Icon size={15} />
        </div>
        <div>
          <div className="ancr-label mb-0.5">{label}</div>
          <div className="text-[13px]">{text}</div>
        </div>
      </div>
      <ArrowUpRight size={16} className="text-ancr-dim group-hover:text-white transition" />
    </Link>
  );
}
