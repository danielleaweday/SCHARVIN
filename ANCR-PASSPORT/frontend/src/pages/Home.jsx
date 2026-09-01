import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, MapPin, Sparkles, Languages, Type, Music, Mic,
  BookOpen, AlertTriangle, ChevronRight, Plane,
} from "lucide-react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { GlassCard, Ring, Bar, Loader, Pill, Disclaimer, fadeUp, staggerContainer } from "@/components/common";
import { fmtDateRange, daysUntil } from "@/lib/format";

const ROTATING = [
  { id: "amara", name: "Amara", role: "Vocalist & Songwriter", region: "Accra, Ghana", pos: "center 25%", img: "https://images.pexels.com/photos/34584334/pexels-photo-34584334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1000&w=1600" },
  { id: "nia", name: "Nia", role: "Composer & Performer", region: "Lagos → Global stage", pos: "center 22%", img: "https://images.unsplash.com/photo-1606946370568-27bb6a2d1b90?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600" },
  { id: "leyla", name: "Leyla", role: "Producer & Engineer", region: "Beirut nights", pos: "center 28%", img: "https://images.unsplash.com/photo-1773008752582-287d6c1ca8ca?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600" },
  { id: "sana", name: "Sana", role: "Multidisciplinary Artist", region: "Istanbul", pos: "center 22%", img: "https://images.pexels.com/photos/30493227/pexels-photo-30493227.png?auto=compress&cs=tinysrgb&dpr=2&h=1000&w=1600" },
];

const shortcuts = [
  { icon: Mic, label: "Start live conversation", to: "/translator?mode=conversation", tone: "cyan" },
  { icon: Type, label: "Translate text", to: "/translator?mode=conversation", tone: "violet" },
  { icon: Music, label: "Translate lyrics", to: "/translator?mode=lyrics", tone: "magenta" },
  { icon: Languages, label: "Rehearsal language", to: "/translator?mode=creative", tone: "amber" },
];

export default function Home() {
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [rot, setRot] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);
  useEffect(() => {
    const t = setInterval(() => setRot((r) => (r + 1) % ROTATING.length), 5000);
    return () => clearInterval(t);
  }, []);

  if (!data) return <Loader label="Loading your dashboard" />;
  const r = data.readiness;
  const dleft = daysUntil(data.upcoming.start_date);
  const active = ROTATING[rot];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8" data-testid="home-page">
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-white/10">
        <AnimatePresence mode="wait">
          <motion.img
            key={active.id}
            src={active.img} alt={active.name}
            initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: active.pos || "center 25%" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/70 to-[#05050A]/20" />
        <div className="absolute right-5 top-5 z-10 hidden rounded-2xl border border-white/12 bg-black/40 px-4 py-2.5 backdrop-blur-md sm:block" data-testid="featured-creative">
          <div className="text-[9px] uppercase tracking-[0.2em] text-cyan/80">Featured Creative</div>
          <div className="font-display text-lg font-600 text-white">{active.name}</div>
          <div className="text-[11px] text-white/60">{active.role} · {active.region}</div>
        </div>
        <div className="relative z-10 flex min-h-[500px] flex-col justify-end p-6 sm:p-10">
          <Pill tone="cyan" className="mb-4 w-fit"><Sparkles className="h-3 w-3" /> Cultural Intelligence</Pill>
          <h1 className="max-w-2xl font-display text-3xl font-700 leading-tight tracking-tight text-white sm:text-5xl">
            {data.greeting}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">
            Understand the world before you enter it — and navigate it responsibly once you arrive.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`); }}
            className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-white/15 bg-black/40 p-1.5 backdrop-blur-xl"
            data-testid="hero-search-form"
          >
            <Search className="ml-3 h-5 w-5 text-white/40" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a country or city"
              data-testid="hero-search-input"
              className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />
            <button type="submit" data-testid="hero-search-submit" className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white transition hover:brightness-110">
              Explore <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-5 flex items-center gap-3">
            {ROTATING.map((d, i) => (
              <button
                key={d.id} onClick={() => setRot(i)} data-testid={`rotator-dot-${d.id}`}
                className={`group flex items-center gap-1.5 text-xs transition ${i === rot ? "text-white" : "text-white/40 hover:text-white/70"}`}
              >
                <span className={`h-1 rounded-full transition-all duration-500 ${i === rot ? "w-8 bg-cyan" : "w-3 bg-white/25"}`} />
                {i === rot && <span className="font-500">{d.name} · {d.region}</span>}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Journey */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard className="group relative h-full overflow-hidden">
            <img src={data.upcoming.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-700 group-hover:opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1021] via-[#0B1021]/85 to-transparent" />
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Pill tone="amber"><Plane className="h-3 w-3" /> Upcoming Journey</Pill>
                <span className="font-mono-p text-xs text-white/60">{dleft > 0 ? `${dleft} days out` : "In progress"}</span>
              </div>
              <h2 className="mt-4 flex items-center gap-2 font-display text-3xl font-700 text-white">
                <MapPin className="h-6 w-6 text-cyan" /> {data.upcoming.destination}
              </h2>
              <p className="mt-1 text-white/60">{data.upcoming.purpose}</p>
              <p className="mt-1 font-mono-p text-sm text-white/45">{fmtDateRange(data.upcoming.start_date, data.upcoming.end_date)}</p>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                <Ring value={data.upcoming.readiness} sub="ready" size={96} />
                <div className="flex-1">
                  <div className="mb-2 text-xs uppercase tracking-widest text-white/40">Required actions</div>
                  <ul className="space-y-1.5">
                    {data.upcoming.required_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link to={`/trips/${data.upcoming.trip_id}`} data-testid="continue-preparation-btn" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-600 text-white transition hover:bg-white/16">
                Continue preparation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Global Readiness */}
        <motion.div variants={fadeUp}>
          <GlassCard className="h-full p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-600 text-white">Global Readiness</h3>
              <Ring value={r.overall} size={64} stroke={6} />
            </div>
            <div className="mt-5 space-y-3.5">
              <Bar label="Passport" value={r.passport} />
              <Bar label="Visa" value={r.visa} />
              <Bar label="Cultural preparation" value={r.cultural} />
              <Bar label="Language preparation" value={r.language} />
              <Bar label="Health & safety" value={r.health_safety} />
              <Bar label="Professional readiness" value={r.professional} />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard className="h-full p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-600 text-white">Continue Learning</h3>
              <Link to="/culture-school" className="text-xs text-cyan hover:underline">Culture School →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.continue_learning.map((l) => (
                <Link key={l.lesson_id} to={`/culture-school/${l.course_id}`} data-testid={`learn-${l.lesson_id}`} className="glass-hover group rounded-xl border border-white/8 bg-white/4 p-4">
                  <BookOpen className="h-5 w-5 text-violet" strokeWidth={1.6} />
                  <div className="mt-3 text-sm font-600 leading-snug text-white">{l.title}</div>
                  <div className="mt-2 font-mono-p text-[11px] text-white/40">{l.minutes} min</div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Translation shortcuts */}
        <motion.div variants={fadeUp}>
          <GlassCard className="h-full p-6">
            <h3 className="mb-4 font-display text-xl font-600 text-white">Translation Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((s) => (
                <Link key={s.label} to={s.to} data-testid={`shortcut-${s.label.toLowerCase().replace(/\s+/g, "-")}`} className="glass-hover flex flex-col gap-2 rounded-xl border border-white/8 bg-white/4 p-4">
                  <s.icon className={`h-5 w-5 text-${s.tone}`} strokeWidth={1.6} />
                  <span className="text-xs font-500 leading-snug text-white/80">{s.label}</span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cultural insight */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard className="group relative h-full overflow-hidden">
            <img src={data.insight.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-700 group-hover:scale-105 group-hover:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1021] to-[#0B1021]/50" />
            <div className="relative z-10 p-6 sm:p-8">
              <Pill tone="violet"><Sparkles className="h-3 w-3" /> Today's Cultural Insight</Pill>
              <h3 className="mt-4 font-display text-2xl font-600 text-white">{data.insight.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">{data.insight.body}</p>
              <Link to={`/explore/${data.insight.destination_id}`} data-testid="insight-learn-more" className="mt-4 inline-flex items-center gap-1.5 text-sm font-600 text-cyan hover:gap-2.5 transition-all">
                Learn more <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Travel alerts */}
        <motion.div variants={fadeUp}>
          <GlassCard className="h-full p-6">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber" strokeWidth={1.6} />
              <h3 className="font-display text-xl font-600 text-white">Travel Alerts</h3>
            </div>
            {data.alerts.map((a, i) => (
              <div key={i} className="rounded-xl border border-amber/20 bg-amber/5 p-4">
                <Pill tone="amber" className="mb-2">Demonstration</Pill>
                <div className="text-sm font-600 text-white">{a.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{a.body}</p>
              </div>
            ))}
            <Disclaimer className="mt-3" text={data.alerts[0].disclaimer} />
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
