import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { Quote, ArrowDown } from "lucide-react";

const KIND_LABEL = {
  milestone: "Milestone", session: "Session", credit: "Credit", collab: "Collaboration",
  release: "Release", award: "Award", residency: "Residency", publication: "Publication",
  certification: "Certification", camp: "Camp", financial: "Financial",
  employment: "Signing", fellowship: "Fellowship", speaking: "Speaking",
  teaching: "Teaching", mentorship: "Mentorship",
};

export default function Timeline() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/ancrid/journey").then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-10" data-testid="journey-page">
      <SectionTitle
        eyebrow="Creator Journey"
        title="Your record, told as a story."
        testid="journey-title"
      />

      {/* Overview strip — chapters at a glance */}
      {data?.chapters && (
        <div className="glass-strong rounded-3xl p-6 md:p-8" data-testid="journey-strip">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Chapters</div>
              <div className="font-display text-2xl tracking-tight text-white mt-1">Student → Lifelong Career</div>
            </div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">
              Began {data.creator?.started}
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-[#00e5ff]/40 via-[#8a2be2]/40 to-[#ff6d00]/40" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.chapters.map((c, i) => (
                <a
                  key={c.code}
                  href={`#chapter-${c.code}`}
                  data-testid={`chapter-nav-${c.code}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 bg-[#050505] flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ borderColor: c.tint }}
                  >
                    <span className="font-mono text-[10px] font-semibold" style={{ color: c.tint }}>{i + 1}</span>
                  </div>
                  <div className="mt-3 font-display text-sm text-white tracking-tight">{c.title}</div>
                  <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/40 mt-1">{c.period}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-16 md:space-y-24">
        {(data?.chapters || []).map((c, idx) => (
          <section
            key={c.code}
            id={`chapter-${c.code}`}
            data-testid={`chapter-${c.code}`}
            className="scroll-mt-24"
          >
            {/* Chapter header */}
            <div className="grid lg:grid-cols-5 gap-6 items-stretch">
              <div className="lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[280px]">
                <img src={c.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.tint}, transparent)` }}
                />
                <div className="relative p-8 md:p-10 flex flex-col justify-end h-full">
                  <div className="font-mono text-[11px] tracking-[0.32em] uppercase" style={{ color: c.tint }}>
                    Chapter {idx + 1} · {c.code}
                  </div>
                  <div className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-3">{c.title}</div>
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 mt-2">
                    {c.subtitle} · {c.period}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 glass rounded-3xl p-7 flex flex-col justify-between">
                <div>
                  <Quote size={18} className="text-white/40" />
                  <div className="text-white/85 text-lg leading-relaxed mt-3 font-display tracking-tight">
                    {c.quote}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">
                    What you gained
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.gains.map(g => (
                      <span key={g} className="text-xs text-white/80 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Opening line */}
            <div className="mt-8 md:mt-10 max-w-3xl">
              <div className="text-white/70 text-lg md:text-xl leading-relaxed font-display tracking-tight">
                {c.opening}
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-10 relative">
              <div
                className="absolute left-[15px] top-2 bottom-2 w-px"
                style={{ background: `linear-gradient(180deg, ${c.tint}80, ${c.tint}20)` }}
              />
              <div className="space-y-5">
                {c.milestones.map((m, i) => (
                  <div key={i} className="relative pl-12" data-testid={`milestone-${c.code}-${i}`}>
                    <span
                      className="absolute left-0 top-1.5 w-8 h-8 rounded-full border-2 bg-[#050505] flex items-center justify-center"
                      style={{ borderColor: m.future ? "rgba(255,255,255,0.2)" : c.tint }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: m.future ? "rgba(255,255,255,0.3)" : c.tint }}
                      />
                    </span>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
                          {m.date} · {m.app}
                          {m.future && <span className="ml-2 text-white/60">· Projected</span>}
                        </div>
                        <div className={`font-display text-lg tracking-tight mt-1 ${m.future ? "text-white/70" : "text-white"}`}>
                          {m.title}
                        </div>
                      </div>
                      <span
                        className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/70 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1 shrink-0"
                      >
                        {KIND_LABEL[m.kind] || m.kind}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter divider */}
            {idx < (data?.chapters?.length || 0) - 1 && (
              <div className="mt-14 flex flex-col items-center">
                <div className="w-px h-14 bg-gradient-to-b from-white/20 to-transparent" />
                <ArrowDown size={14} className="text-white/30 -mt-1" />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
