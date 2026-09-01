import React from "react";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { Section, Chip } from "@/components/common/Primitives";
import { Video, Users, Award, FileText, Sparkles, ArrowUpRight } from "lucide-react";

const SESSIONS = [
  { title: "Sylvia Massy · Sonic Risk", when: "Thu · 15:00", guest: "Sylvia Massy · Producer", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=700&fit=crop", live: true },
  { title: "A&R Panel · Live Signing", when: "Fri · 11:00", guest: "Ivy Marsh + 3 execs",       cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=700&fit=crop", live: true },
];

const PROS = [
  { name: "Prof. Terrence Bloom", role: "Artist in Residence · Studio Director", students: 6, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop" },
  { name: "Ivy Marsh", role: "Executive in Residence · Publishing/A&R", students: 24, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop" },
  { name: "Lucas Neri", role: "Adjunct · Sound Design & Mix", students: 12, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
];

export default function COHEIRModule() {
  return (
    <ModuleShell current="COHEIR">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 md:px-10 py-14">
        <div className="ancr-label mb-3" style={{ color: "#F59E0B" }}>COHEIR™ · Mentorship & Industry</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight max-w-3xl">
          <em className="italic text-ancr-dim">Working artists</em><br />are on the team.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
          Faculty, executives, adjuncts, artists-in-residence, and industry pros operate inside the ecosystem. Live sessions, office hours, portfolio critiques, and signed recommendations that carry weight.
        </p>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current="COHEIR" />

        {/* Live */}
        <section>
          <Section eyebrow="This week" title="Live industry sessions" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {SESSIONS.map((s) => (
              <article key={s.title} className="group relative overflow-hidden rounded-2xl border border-white/[0.08]">
                <img src={s.cover} alt="" className="h-52 w-full object-cover opacity-55 group-hover:opacity-70 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center gap-2">
                    {s.live && <span className="flex items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/[0.08] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[#F59E0B]"><span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" /> Live</span>}
                    <Chip>{s.when}</Chip>
                  </div>
                  <div>
                    <div className="font-serif text-2xl leading-tight">{s.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-ancr-dim">{s.guest}</div>
                    <div className="mt-3 flex gap-2">
                      <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3"><Video size={11} /> RSVP</button>
                      <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">ANCRVIEW™ recording <ArrowUpRight size={11} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Residents */}
        <section>
          <Section eyebrow="Residents & Adjuncts" title="Book time with a professional" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PROS.map((p) => (
              <div key={p.name} className="ancr-card p-6">
                <img src={p.avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10" />
                <div className="mt-4 font-serif text-xl leading-tight">{p.name}</div>
                <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">{p.role}</div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                  <div className="font-mono text-[10px] text-ancr-mute">{p.students} active</div>
                  <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Book</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <Section eyebrow="Signed recommendations" title="From working professionals to publishers, labels, and venues" />
          <div className="mt-6 space-y-3">
            {[
              { student: "Maya Ellis", target: "Sony Publishing · Associate", author: "Prof. Bloom", status: "draft" },
              { student: "Ava Reyes", target: "Interscope · Junior A&R", author: "Ivy Marsh", status: "signed" },
              { student: "Noah King", target: "Kobalt · Publishing Assistant", author: "Ivy Marsh", status: "sent" },
            ].map((r, i) => (
              <div key={i} className="ancr-card flex items-center gap-4 p-5">
                <Award size={16} className="text-[#F59E0B] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-serif text-[15px]">{r.student} · {r.target}</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">Authored by {r.author}</div>
                </div>
                <Chip tone={r.status === "signed" ? "success" : r.status === "sent" ? "accent" : "warn"}>{r.status}</Chip>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}
