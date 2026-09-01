import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles, Users, Plus } from "lucide-react";

const TEAMS = [
  {
    id: "t1", name: "Nightshift", kind: "Writing Room",
    project: "Cathedral in July · v3",
    members: [
      { name: "Maya Ellis", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", role: "Songwriter" },
      { name: "Ava Reyes", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", role: "Top-line" },
      { name: "Lena Park", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", role: "Lyricist" },
    ],
    activity: 92, chemistry: 88, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
  },
  {
    id: "t2", name: "Lo-Fi Society", kind: "Production Collective",
    project: "Compilation EP · Winter",
    members: [
      { name: "Maya Ellis", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", role: "Producer" },
      { name: "Noah King", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", role: "Engineer" },
      { name: "Dre Walker", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", role: "Performer" },
    ],
    activity: 61, chemistry: 74, cover: "https://images.unsplash.com/photo-1574517947730-55cb23e608c2?w=800&h=400&fit=crop",
  },
];

export default function CreativeTeamManagement() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Creative Team Management"
        title={<span><em className="italic text-ancr-dim">Compose</em> chemistry, not just rosters</span>}
        sub="Assemble writing rooms, production collectives, and performance cells. AIAH surfaces chemistry signals from ANCRSync™ activity."
        right={<button className="ancr-btn ancr-btn-primary"><Plus size={12} /> New Team</button>}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {TEAMS.map((t) => (
          <article key={t.id} className="ancr-card overflow-hidden">
            <div className="relative h-32">
              <img src={t.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute inset-0 flex items-end p-5">
                <div>
                  <div className="ancr-label">{t.kind}</div>
                  <div className="mt-1 font-serif text-2xl leading-tight">{t.name}</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2">
                <Chip tone="accent">Active project</Chip>
                <span className="text-[13px]">{t.project}</span>
              </div>
              <div className="mt-4 space-y-2">
                {t.members.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <img src={m.avatar} className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" alt="" />
                    <div className="flex-1">
                      <div className="font-serif text-[14px]">{m.name}</div>
                      <div className="font-mono text-[10px] text-ancr-mute uppercase tracking-widest">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Meter label="Activity" v={t.activity} />
                <Meter label="Chemistry" v={t.chemistry} />
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <Sparkles size={13} className="text-[var(--ancra-accent)] mt-0.5 flex-shrink-0" />
                <div className="text-[12.5px] leading-relaxed text-ancr-dim">
                  {t.chemistry > 80
                    ? "This room is in flow. Consider extending to a full EP arc."
                    : "Chemistry dips on production-heavy weeks. Pair with an ANCRSync™ jam block."}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Meter({ label, v }) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px]">
        <span className="text-ancr-mute uppercase tracking-widest">{label}</span>
        <span className="text-white">{v}</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full bg-[var(--ancra-accent)] shadow-[0_0_8px_var(--ancra-accent-glow)]" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
