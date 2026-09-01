import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";

export default function Education() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/education").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="education-page">
      <SectionTitle eyebrow="Education · Coursework & Capstones" title="Where your practice is being built." testid="education-title" />

      <div className="space-y-6">
        {items.map((e, i) => (
          <div key={i} data-testid={`edu-${i}`} className="glass rounded-3xl p-7 hover-lift">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{e.years}</div>
                <div className="font-display text-2xl tracking-tight text-white mt-1">{e.institution}</div>
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/60 mt-1">{e.degree}</div>
              </div>
              {e.capstone && (
                <div className="text-right">
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">Capstone</div>
                  <div className="text-white text-sm mt-1">{e.capstone}</div>
                </div>
              )}
            </div>
            <div className="mt-5 grid md:grid-cols-2 gap-6 pt-5 border-t border-white/5">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40 mb-2">Courses</div>
                <div className="flex flex-wrap gap-2">
                  {e.courses.map(c => (
                    <span key={c} className="text-xs text-white/80 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40 mb-2">Mentors & Faculty</div>
                <div className="flex flex-wrap gap-2">
                  {e.mentors.map(m => (
                    <span key={m} className="text-xs text-white bg-white/[0.08] border border-white/15 rounded-full px-3 py-1.5">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
