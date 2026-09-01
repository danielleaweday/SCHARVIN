import React from "react";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { Section, Chip } from "@/components/common/Primitives";
import { Music, FileCheck, Sparkles, DollarSign, Shield } from "lucide-react";

const SONGS = [
  { title: "Cathedral in July", status: "Publisher inquiry", split: "Ellis 60 · Reyes 40", cert: "Issued", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop" },
  { title: "Half-Light Room",   status: "Ready to publish",  split: "Ellis 100",              cert: "Issued", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=800&fit=crop" },
  { title: "Say Less",          status: "Copyright cleared", split: "Ellis 70 · Reyes 20 · Park 10", cert: "Issued", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop" },
  { title: "Blue Hour",         status: "Splits pending",    split: "—",                       cert: "Draft",  cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop" },
];

export default function INHEIRAModule() {
  return (
    <ModuleShell current="INHEIRA">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 md:px-10 py-14">
        <div className="ancr-label mb-3" style={{ color: "#EC4899" }}>INHEIRA™ · Songs · Splits · Publishing</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight max-w-3xl">
          <em className="italic text-ancr-dim">Every song</em><br />registered. Every split protected.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
          The moment work leaves ANCRLAB™, INHEIRA™ preserves authorship, splits, ownership, and copyright — ready for publishers, sync houses, and royalty flow through Vaulta™.
        </p>
        <div className="mt-6 flex gap-2">
          <button className="ancr-btn ancr-btn-primary"><Shield size={12} /> Register a song</button>
          <button className="ancr-btn ancr-btn-ghost"><FileCheck size={12} /> Issue certificate</button>
        </div>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current="INHEIRA" />

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Registered" value="13/30" />
          <Stat label="Publisher inquiries" value="1 new" accent="#EC4899" />
          <Stat label="Splits verified" value="11" />
          <Stat label="YTD royalties · Vaulta" value="$1,204" />
        </section>

        {/* Songs */}
        <section>
          <Section eyebrow="Registered songs" title="Live catalogue" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SONGS.map((s) => (
              <div key={s.title} className="group ancr-card overflow-hidden">
                <div className="relative h-48">
                  <img src={s.cover} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute inset-x-3 bottom-3">
                    <div className="font-serif text-lg leading-tight">{s.title}</div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <Chip tone="accent">{s.status}</Chip>
                  <div className="font-mono text-[10.5px] text-ancr-mute">Split · {s.split}</div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-ancr-dim">
                    <FileCheck size={11} className={s.cert === "Issued" ? "text-emerald-300" : "text-amber-300"} />
                    Certificate · {s.cert}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Split flow */}
        <section>
          <Section eyebrow="Split flow" title="How ownership travels" />
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">
            {[
              { s: "ANCRLAB™", d: "Song mastered", c: "#38B6FF" },
              { s: "ANCRSync™", d: "Co-writer chemistry logged", c: "#8B5CF6" },
              { s: "INHEIRA™", d: "Splits + certificate issued", c: "#EC4899" },
              { s: "Vaulta™", d: "Royalty flow activated", c: "#EAB308" },
              { s: "ANCRWAV™", d: "Released to DSPs", c: "#06B6D4" },
            ].map((n, i) => (
              <div key={i} className="ancr-card p-5">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ background: n.c, boxShadow: `0 0 10px ${n.c}` }} />
                <div className="mt-3 font-serif text-lg leading-tight">{n.s}</div>
                <div className="mt-1 font-mono text-[10px] text-ancr-dim">Step {i + 1}</div>
                <div className="mt-3 text-[12.5px] text-ancr-dim">{n.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ancr-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#EC4899]" />
            <div className="ancr-label" style={{ color: "#EC4899" }}>AIAH™ · Publishing</div>
          </div>
          <div className="mt-3 font-serif text-2xl leading-snug text-ancr-dim">
            Kobalt inquiry on "Half-Light Room" has been open for 3 days. Draft a response now — I can pull your ANCRWAV™ streaming trend and Booking Packet™ into the message.
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="ancr-card p-5">
      <div className="ancr-label">{label}</div>
      <div className="mt-3 font-mono text-2xl tracking-tight" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}
