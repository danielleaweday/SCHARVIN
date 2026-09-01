import React from "react";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { Section, Chip } from "@/components/common/Primitives";
import { MessageSquare, Users, Mic, Sparkles, Plus } from "lucide-react";

const ROOMS = [
  { name: "Nightshift", kind: "Writing Room", members: ["Maya Ellis","Ava Reyes","Lena Park"], project: "Cathedral in July · v3", messages: 42, live: true },
  { name: "Lo-Fi Society", kind: "Production Collective", members: ["Maya Ellis","Noah King","Dre Walker","+2"], project: "Compilation EP · Winter", messages: 18, live: false },
  { name: "Cohort 07 · Guest week", kind: "Cross-cohort", members: ["40 members"], project: "Guest writer sessions", messages: 210, live: true },
];

const THREADS = [
  { user: "Ava Reyes", when: "12m", text: "New top-line on the bridge. take a listen when you're free.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { user: "Lena Park", when: "1h",  text: "Chorus 3 line — the 'motorway' image reappears. Consider a variation.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
  { user: "Maya Ellis", me: true, when: "2h", text: "yes agreed. i'll rewrite it tonight. also uploaded the demo to ANCRLAB.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { user: "AIAH", ai: true, when: "3h", text: "Room chemistry at 88 (top 15%). Consider a shared writing session in Studio B on Friday."},
];

export default function ANCRSyncModule() {
  return (
    <ModuleShell current="ANCRSync">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 md:px-10 py-14">
        <div className="ancr-label mb-3" style={{ color: "#8B5CF6" }}>ANCRSync™ · Collaboration</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight max-w-3xl">
          <em className="italic text-ancr-dim">Writing rooms,</em><br />teams, and shared work.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
          Live writing rooms with timestamped feedback, session recordings, and automatic INHEIRA™ split registration. Every collaboration is a chemistry signal for your ANCRID™.
        </p>
        <div className="mt-6 flex gap-2">
          <button className="ancr-btn ancr-btn-primary"><Plus size={12} /> New Writing Room</button>
          <button className="ancr-btn ancr-btn-ghost"><Mic size={12} /> Join active</button>
        </div>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current="ANCRSync" />

        {/* Rooms + chat */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Section eyebrow="Your rooms" title="Active collaborations" />
            <div className="mt-6 space-y-3">
              {ROOMS.map((r) => (
                <div key={r.name} className="ancr-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/10 p-2"><Users size={14} className="text-[#8B5CF6]" /></div>
                    <div className="flex-1">
                      <div className="font-serif text-xl leading-tight">{r.name}</div>
                      <div className="mt-1 font-mono text-[10px] text-ancr-mute uppercase tracking-wider">{r.kind}</div>
                    </div>
                    {r.live && <span className="flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#8B5CF6]"><span className="h-1 w-1 rounded-full bg-[#8B5CF6] animate-pulse" /> Live</span>}
                  </div>
                  <div className="mt-3 text-[13px] text-ancr-dim">{r.project}</div>
                  <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-ancr-mute">
                    <span>{r.members.slice(0, 3).join(" · ")}{r.members.length > 3 ? " · " + (r.members.length - 3) + " more" : ""}</span>
                    <span>·</span>
                    <span><MessageSquare size={9} className="inline mr-1" />{r.messages}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div className="lg:col-span-7">
            <Section eyebrow="Nightshift" title="Room · Cathedral in July · v3" />
            <div className="mt-6 ancr-card overflow-hidden">
              <div className="max-h-[560px] space-y-3 overflow-y-auto p-5">
                {THREADS.map((t, i) => (
                  <div key={i} className={`flex gap-3 ${t.me ? "justify-end" : ""}`}>
                    {!t.me && (
                      t.ai
                        ? <div className="h-8 w-8 rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/[0.06] flex items-center justify-center"><Sparkles size={12} className="text-[#8B5CF6]" /></div>
                        : <img src={t.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                      t.me ? "bg-[#8B5CF6] text-white"
                        : t.ai ? "border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.06] text-ancr-text"
                        : "border border-white/[0.06] bg-white/[0.02] text-ancr-text"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-[13px]">{t.user}</span>
                        <span className="font-mono text-[9px] text-white/60">{t.when}</span>
                      </div>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] p-3">
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
                  <input placeholder="Reply to Nightshift…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ancr-mute" />
                  <button className="rounded-full bg-[#8B5CF6] p-2 text-white"><MessageSquare size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}
