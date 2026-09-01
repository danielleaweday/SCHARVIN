import React from "react";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { Section, Chip, StatCell } from "@/components/common/Primitives";
import { Play, Upload, Waves, Layers, Mic, Volume2, Sparkles } from "lucide-react";

const PROJECTS = [
  { id: "p1", title: "Cathedral in July", kind: "Master · v3", updated: "42m", tracks: 24, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=900&fit=crop" },
  { id: "p2", title: "Half-Light Room", kind: "Mix", updated: "6h", tracks: 18, cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1600&h=900&fit=crop" },
  { id: "p3", title: "Compilation EP · Winter", kind: "EP · 5 tracks", updated: "yesterday", tracks: 41, cover: "https://images.unsplash.com/photo-1574517947730-55cb23e608c2?w=1600&h=900&fit=crop" },
];

const STUDIOS = [
  { room: "Studio A", when: "09:30 · 45m", who: "Vocal capture · Ava", state: "in_use" },
  { room: "Studio B", when: "14:00 · 2h",  who: "Mix session · L. Neri", state: "booked" },
  { room: "Live Room", when: "17:00 · 1h", who: "Available",              state: "free" },
];

export default function ANCRLABModule() {
  return (
    <ModuleShell current="ANCRLAB">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 md:px-10 py-14">
        <div className="ancr-label mb-3" style={{ color: "#38B6FF" }}>ANCRLAB™ · The Studio</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight max-w-3xl">
          <em className="italic text-ancr-dim">Where</em> creative work<br />actually gets made.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
          Book physical rooms. Compose in the browser DAW. Version stems. Collaborate live with peers, faculty, and mentors. Everything you produce is one click away from INHEIRA™ registration and ANCRWAV™ release.
        </p>
        <div className="mt-6 flex gap-2">
          <button className="ancr-btn ancr-btn-primary"><Play size={12} className="fill-black" /> Open the DAW</button>
          <button className="ancr-btn ancr-btn-ghost"><Upload size={12} /> Upload stems</button>
        </div>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current="ANCRLAB" />

        {/* Active studios */}
        <section>
          <Section eyebrow="Live studio activity" title="Rooms · today" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STUDIOS.map((s) => (
              <div key={s.room} className="ancr-card p-5">
                <div className="flex items-center justify-between">
                  <div className="ancr-label">{s.state === "in_use" ? "In use" : s.state === "booked" ? "Booked" : "Free"}</div>
                  <span className={`h-2 w-2 rounded-full ${s.state === "in_use" ? "bg-[#38B6FF] shadow-[0_0_8px_#38B6FF]" : s.state === "booked" ? "bg-amber-300" : "bg-emerald-400"}`} />
                </div>
                <div className="mt-3 font-serif text-2xl">{s.room}</div>
                <div className="mt-1 font-mono text-[11px] text-ancr-dim">{s.when}</div>
                <div className="mt-3 text-[13px]">{s.who}</div>
                <button className="ancr-btn ancr-btn-ghost mt-4 text-[10px] py-1.5 px-3">{s.state === "free" ? "Book room" : "View"}</button>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <Section eyebrow="Projects" title="Active studio work" />
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <div key={p.id} className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.08]">
                <img src={p.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <Chip>{p.kind}</Chip>
                  <div>
                    <div className="font-serif text-2xl leading-tight">{p.title}</div>
                    <div className="mt-2 font-mono text-[10px] text-ancr-dim">{p.tracks} tracks · updated {p.updated}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DAW preview mock */}
        <section>
          <Section eyebrow="Browser DAW" title="Open a session" />
          <div className="mt-6 ancr-card overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-white/[0.05] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              <div className="p-5">
                <div className="ancr-label">Track</div>
                <div className="mt-2 space-y-2 font-mono text-[11px]">
                  {["Vocal · Take 3", "Piano · Bosendorfer", "Bass · Sub 808", "Drums · Vinyl Kit"].map((t) => (
                    <div key={t} className="flex items-center gap-2 rounded border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#38B6FF]" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 p-5">
                <div className="ancr-label mb-3">Timeline</div>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex h-8 items-center gap-[2px] rounded border border-white/[0.05] bg-black/40 p-1">
                      {Array.from({ length: 60 }).map((_, j) => (
                        <div key={j} className="w-full flex-1 rounded-sm" style={{ background: `rgba(56,182,255,${0.15 + Math.abs(Math.sin(j / 4 + i)) * 0.5})`, height: `${30 + Math.abs(Math.sin(j / 3 + i)) * 60}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="ancr-label mb-3">Master</div>
                <div className="flex items-center gap-3">
                  <Volume2 size={14} className="text-ancr-dim" />
                  <div className="flex-1 h-1 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-[#38B6FF]" /></div>
                </div>
                <div className="mt-4 space-y-2 font-mono text-[10px] text-ancr-dim">
                  <div>-8.2 LUFS</div>
                  <div>44.1 kHz</div>
                  <div>2 · master + 24 stems</div>
                </div>
                <button className="ancr-btn ancr-btn-primary mt-4 w-full justify-center text-[10px] py-2">Export to INHEIRA™</button>
              </div>
            </div>
          </div>
        </section>

        {/* AI */}
        <section className="ancr-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#38B6FF]" />
            <div className="ancr-label" style={{ color: "#38B6FF" }}>AIAH™ · Studio</div>
          </div>
          <div className="mt-3 font-serif text-2xl leading-snug text-ancr-dim">
            Your master bus is at -8.2 LUFS — hotter than the streaming target. Want me to schedule a 20-minute mastering session with Lucas on Thursday afternoon?
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}
