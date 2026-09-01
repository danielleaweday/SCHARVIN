import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, StatCell, ExperienceTile, Chip, ProgressRing } from "@/components/common/Primitives";
import { ArrowUpRight, Play, MapPin, Clock, Zap, Music, Award, Users } from "lucide-react";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";

const fetcher = (path) => get(path);

export default function StudentDashboard() {
  const { data } = useSWR("/student/dashboard", fetcher);
  const nav = useNavigate();

  if (!data) return <SkeletonHero />;

  const { student, journey, schedule, songs, capstones, experiences, sessions, achievements } = data;

  const songStats = songs.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const doneSongs = (songStats.released || 0) + (songStats.mastered || 0) + (songStats.mixed || 0);

  return (
    <div className="ancr-reveal">
      {/* CINEMATIC HERO */}
      <section className="relative overflow-hidden">
        <div className="ancr-halo ancr-halo-accent -left-32 -top-32 h-[420px] w-[420px]" />
        <div className="px-6 md:px-10 pt-10 pb-6">
          <div className="ancr-label mb-3">Learning Journey™ · {student.cohort}</div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
            <span className="italic text-ancr-dim">Good morning,</span><br />
            {student.name}.
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Chip>Semester 3</Chip>
            <Chip>{student.concentration}</Chip>
            <Chip tone="accent">Portfolio {student.portfolio_score}</Chip>
            <Chip>Grad readiness {student.graduation_readiness}%</Chip>
          </div>
        </div>
      </section>

      {/* PRIMARY GRID */}
      <section className="grid grid-cols-1 gap-6 px-6 md:px-10 lg:grid-cols-12">
        {/* Journey progress ring */}
        <div className="lg:col-span-4 ancr-card overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="ancr-label">Journey Progress</div>
                <div className="mt-1 font-serif text-xl">{journey?.phase}</div>
              </div>
              <Link to="/journey" data-testid="link-journey" className="rounded-full border border-white/10 p-1.5 hover:border-white/30">
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="mt-4 flex justify-center">
              <ProgressRing value={journey?.progress || 0} size={190} label="Semester 3" sub="6 milestones · 3 done" />
            </div>
            <div className="mt-6 space-y-3">
              {journey?.milestones?.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${m.done ? "bg-white" : m.current ? "bg-[var(--ancra-accent)] shadow-[0_0_10px_var(--ancra-accent-glow)]" : "bg-white/20"}`} />
                  <div className="flex-1 font-mono text-[11px] tracking-wide">
                    <span className={m.done ? "text-ancr-dim line-through" : m.current ? "text-white" : "text-ancr-dim"}>
                      {m.label}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-ancr-mute">{m.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-5 ancr-card overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="ancr-label">Today's Schedule</div>
                <div className="mt-1 font-serif text-xl">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
              </div>
              <Link to="/calendar" className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3" data-testid="link-calendar">
                Full Calendar
              </Link>
            </div>
            <div className="mt-5 space-y-2.5">
              {schedule.slice(0, 4).map((e) => (
                <div key={e.id} className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/15">
                  <div className="w-14 text-center font-mono text-[11px] leading-tight">
                    <div className="text-white">{e.start}</div>
                    <div className="text-ancr-mute text-[9px]">{e.end}</div>
                  </div>
                  <div className="h-9 w-px bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] leading-tight truncate">{e.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-ancr-mute">
                      <MapPin size={9} />{e.location}
                    </div>
                  </div>
                  <Chip>{e.module}</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column stack */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="ancr-card p-5">
            <div className="ancr-label">Portfolio Score</div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-serif text-5xl tracking-tight">{student.portfolio_score}</div>
              <div className="font-mono text-[11px] text-emerald-300">+2 this week</div>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-white" style={{ width: `${student.portfolio_score}%` }} />
            </div>
            <Link to="/portfolio" data-testid="link-portfolio" className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ancr-dim hover:text-white">
              4 reviewed works <ArrowUpRight size={11} />
            </Link>
          </div>

          <Link
            to="/thirty-song"
            data-testid="link-thirty-song"
            className="ancr-card group block p-5 transition hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="ancr-label">30 Song Progress™</div>
                <div className="mt-2 font-serif text-2xl">
                  {doneSongs}<span className="text-ancr-mute">/30</span>
                </div>
              </div>
              <Music size={16} className="text-ancr-dim" />
            </div>
            <div className="mt-4 grid grid-cols-6 gap-1">
              {songs.map((s, i) => (
                <div key={i} className={`h-6 rounded-sm ${
                  s.status === "released" ? "bg-white" :
                  s.status === "mastered" ? "bg-white/80" :
                  s.status === "mixed"    ? "bg-white/55" :
                  s.status === "recorded" ? "bg-white/35" :
                  s.status === "demo"     ? "bg-white/20" :
                  s.status === "writing"  ? "bg-white/12" :
                                             "bg-white/[0.04]"
                }`} title={`${s.number}. ${s.title} — ${s.status}`} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-ancr-mute">
              <span>Locked → Released</span>
              <ArrowUpRight size={11} className="text-ancr-dim group-hover:text-white transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* CURRENT EXPERIENCES */}
      <section className="px-6 md:px-10 mt-14">
        <Section
          eyebrow="Studio Experiences™ · In progress"
          title={<span><em className="italic text-ancr-dim">Continue your</em> current work</span>}
          right={
            <Link to="/journey" data-testid="link-all-experiences" className="ancr-btn ancr-btn-ghost">
              All experiences <ArrowUpRight size={12} />
            </Link>
          }
        />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {experiences.map((exp) => (
            <ExperienceTile key={exp.id} exp={exp} onClick={() => nav(`/experience/${exp.id}`)} />
          ))}
        </div>
      </section>

      {/* UPCOMING INDUSTRY + CAPSTONES */}
      <section className="grid grid-cols-1 gap-6 px-6 md:px-10 mt-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Section
            eyebrow="Master Sessions™ + Industry"
            title="This week's arrivals"
          />
          <div className="mt-6 space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-52 aspect-video md:aspect-auto">
                    <img src={s.cover} alt="" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/60" />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-3">
                      <Chip tone="accent">{s.kind === "master" ? "Master Session™" : s.kind === "industry" ? "Industry" : "Critique"}</Chip>
                      <span className="font-mono text-[11px] text-ancr-dim">{s.when}</span>
                    </div>
                    <div className="mt-2 font-serif text-2xl leading-tight">{s.title}</div>
                    <div className="mt-2 font-mono text-[11px] text-ancr-mute">Featuring · {s.guest}</div>
                    <div className="mt-4 flex items-center gap-2">
                      <button className="ancr-btn ancr-btn-primary">RSVP</button>
                      <button className="ancr-btn ancr-btn-ghost">Add to Calendar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <Section eyebrow="Capstones™" title="In development" />
          <div className="mt-6 space-y-5">
            {capstones.map((c) => (
              <Link to="/capstones" key={c.id} className="group relative block overflow-hidden rounded-2xl border border-white/[0.08]" data-testid={`capstone-${c.id}`}>
                <img src={c.cover} className="h-40 w-full object-cover opacity-40 transition duration-700 group-hover:opacity-55 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <div className="flex items-center gap-2">
                    <Chip>Capstone™</Chip>
                    <span className="font-mono text-[10px] text-ancr-dim">{c.phase}</span>
                  </div>
                  <div>
                    <div className="font-serif text-xl leading-tight">{c.title}</div>
                    <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-white" style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-ancr-mute">
                      {c.progress}% · advisor {c.advisor}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="px-6 md:px-10 mt-14">
        <Section eyebrow="Signals" title="Recent achievements" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {achievements.map((a) => (
            <div key={a.id} className="ancr-card p-4">
              <Award size={16} className="text-[var(--ancra-accent)]" />
              <div className="mt-3 text-[12px] leading-tight">{a.title}</div>
              <div className="mt-2 font-mono text-[10px] text-ancr-mute">{a.when}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ECOSYSTEM LAUNCHER */}
      <section className="px-6 md:px-10 mt-14 mb-24">
        <EcosystemLauncher current="ANCRA" />
      </section>
    </div>
  );
}

function SkeletonHero() {
  return (
    <div className="p-10">
      <div className="h-4 w-32 bg-white/5 rounded ancr-fade" />
      <div className="mt-6 h-16 w-2/3 bg-white/5 rounded ancr-fade" />
      <div className="mt-4 h-6 w-1/3 bg-white/5 rounded ancr-fade" />
    </div>
  );
}
