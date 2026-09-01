import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Video, Users, Calendar as CalendarIcon, FileText, Award, Sparkles, ArrowUpRight } from "lucide-react";

const TABS = [
  { id: "sessions", label: "Live Industry Sessions" },
  { id: "office", label: "Office Hours" },
  { id: "reviews", label: "Mentor Reviews" },
  { id: "recs", label: "Recommendations" },
  { id: "critiques", label: "Portfolio Critiques" },
  { id: "residents", label: "Residents & Adjuncts" },
];

const SESSIONS = [
  { id: "s1", title: "Sylvia Massy · Sonic Risk in Modern Records", when: "Thu · 15:00", guest: "Sylvia Massy · Producer",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=700&fit=crop", live: true, seats: "24 of 30" },
  { id: "s2", title: "A&R Panel · Live Signing Decisions", when: "Fri · 11:00", guest: "Ivy Marsh + 3 execs",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=700&fit=crop", live: true, seats: "28 of 30" },
  { id: "s3", title: "Kobalt · Publishing 101", when: "Next week", guest: "Kobalt A&R",
    cover: "https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=1200&h=700&fit=crop", live: false, seats: "12 of 30" },
];

const OFFICE_HOURS = [
  { faculty: "Prof. Terrence Bloom", role: "Studio Director · Artist in Residence", slots: ["Tue 14:00", "Tue 15:00", "Thu 14:00", "Thu 15:00"], avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop" },
  { faculty: "Ivy Marsh", role: "Executive in Residence", slots: ["Wed 10:00", "Wed 11:00"], avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop" },
  { faculty: "Lucas Neri", role: "Adjunct · Producer", slots: ["Mon 16:00", "Fri 12:00"], avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
];

const RESIDENTS = [
  { name: "Prof. Terrence Bloom", role: "Artist in Residence", spec: "Songwriting Architecture", cohort: "Cohort 07", students: 6, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop" },
  { name: "Ivy Marsh", role: "Executive in Residence", spec: "Publishing · A&R", cohort: "All cohorts", students: 24, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop" },
  { name: "Lucas Neri", role: "Adjunct Professor", spec: "Sound Design · Mix", cohort: "Cohort 06 · 07", students: 12, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
];

const RECS = [
  { student: "Maya Ellis", target: "Sony Publishing · Associate", author: "Prof. Terrence Bloom", status: "draft" },
  { student: "Ava Reyes", target: "Interscope · Junior A&R", author: "Ivy Marsh", status: "signed" },
  { student: "Noah King", target: "Kobalt · Publishing Assistant", author: "Ivy Marsh", status: "sent" },
];

const CRITIQUES = [
  { student: "Maya Ellis", work: "Cathedral in July", panel: "T. Bloom · I. Marsh · L. Neri", when: "Fri", status: "scheduled" },
  { student: "Ava Reyes", work: "The Understudy", panel: "T. Bloom · I. Marsh", when: "Fri", status: "scheduled" },
  { student: "Lena Park", work: "Kite String", panel: "T. Bloom", when: "Mon", status: "in_review" },
];

export default function COHEIRSuite() {
  const [tab, setTab] = React.useState("sessions");
  return (
    <div className="ancr-reveal">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="ancr-halo ancr-halo-accent -right-24 -top-24 h-[420px] w-[420px]" />
        <div className="px-6 md:px-10 py-12">
          <div className="ancr-label mb-3">Ecosystem Hub · COHEIR™</div>
          <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight">
            <em className="italic text-ancr-dim">The</em> mentorship & industry layer
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
            COHEIR™ is where working artists, executives, and adjuncts operate inside the ANCR ecosystem. Live sessions, office hours, portfolio critiques, and signed recommendations — all connected to student journeys.
          </p>
        </div>
      </section>

      {/* Tab strip */}
      <div className="sticky top-[72px] z-20 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
        <div className="flex gap-1 overflow-x-auto px-6 md:px-10 py-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`coheir-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                tab === t.id ? "bg-white text-black" : "text-ancr-dim hover:text-white"
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-10 py-10">
        {tab === "sessions" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {SESSIONS.map((s) => (
              <article key={s.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.08]">
                <img src={s.cover} alt="" className="h-56 w-full object-cover opacity-50 group-hover:opacity-70 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center gap-2">
                    {s.live && <span className="flex items-center gap-1.5 rounded-full border border-[var(--ancra-accent)]/40 bg-[var(--ancra-accent)]/[0.08] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ancra-accent)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--ancra-accent)] animate-pulse" /> Live</span>}
                    <Chip>{s.when}</Chip>
                    <div className="ml-auto font-mono text-[10px] text-white/70">{s.seats}</div>
                  </div>
                  <div>
                    <div className="font-serif text-2xl leading-tight">{s.title}</div>
                    <div className="mt-2 font-mono text-[11px] text-ancr-dim">{s.guest}</div>
                    <div className="mt-4 flex gap-2">
                      <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3"><Video size={11} /> RSVP</button>
                      <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Recording via ANCRVIEW™ <ArrowUpRight size={11} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "office" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {OFFICE_HOURS.map((o) => (
              <div key={o.faculty} className="ancr-card p-6">
                <div className="flex items-center gap-3">
                  <img src={o.avatar} className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10" alt="" />
                  <div>
                    <div className="font-serif text-lg leading-tight">{o.faculty}</div>
                    <div className="font-mono text-[10px] text-ancr-mute uppercase tracking-wider">{o.role}</div>
                  </div>
                </div>
                <div className="mt-5 ancr-label mb-3">Book a slot</div>
                <div className="grid grid-cols-2 gap-2">
                  {o.slots.map((slot) => (
                    <button key={slot} data-testid={`slot-${slot.replace(/\s/g, "-")}`} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[11px] hover:border-white/25 hover:bg-white/[0.06]">
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-3">
            {["Portfolio · Cathedral in July · Prof. Bloom · signed", "Song · Say Less · Lucas Neri · signed", "Reflection · Learning journey · Prof. Bloom · signed"].map((r, i) => (
              <div key={i} className="ancr-card flex items-center gap-4 p-5">
                <FileText size={16} className="text-ancr-dim" />
                <div className="flex-1 text-[13.5px]">{r}</div>
                <Chip tone="success">signed</Chip>
              </div>
            ))}
          </div>
        )}

        {tab === "recs" && (
          <div className="space-y-3">
            {RECS.map((r, i) => (
              <div key={i} className="ancr-card flex items-center gap-5 p-5">
                <Award size={16} className="text-[var(--ancra-accent)] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-serif text-[15px]">{r.student} · {r.target}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">Authored by {r.author}</div>
                </div>
                <Chip tone={r.status === "signed" ? "success" : r.status === "sent" ? "accent" : "warn"}>{r.status}</Chip>
              </div>
            ))}
          </div>
        )}

        {tab === "critiques" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CRITIQUES.map((c, i) => (
              <div key={i} className="ancr-card p-5">
                <div className="ancr-label">Live Critique</div>
                <div className="mt-2 font-serif text-xl">{c.student}</div>
                <div className="mt-1 font-mono text-[11px] text-ancr-dim">"{c.work}"</div>
                <div className="mt-4 text-[12px] text-ancr-dim">Panel · {c.panel}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ancr-mute">{c.when}</div>
                  <Chip tone={c.status === "scheduled" ? "accent" : "warn"}>{c.status.replace("_", " ")}</Chip>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "residents" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {RESIDENTS.map((p) => (
              <div key={p.name} className="ancr-card overflow-hidden">
                <div className="p-6">
                  <img src={p.avatar} className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10" alt="" />
                  <div className="mt-4 font-serif text-xl leading-tight">{p.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">{p.role}</div>
                  <div className="mt-3 text-[13px] text-ancr-dim">{p.spec}</div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                    <div className="font-mono text-[10px] text-ancr-mute">{p.cohort}</div>
                    <div className="font-mono text-[12px]">{p.students} students</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
