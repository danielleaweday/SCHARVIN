import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { ArrowUpRight } from "lucide-react";

export default function Capstones() {
  const { data } = useSWR("/student/capstones", get);
  const list = data?.capstones || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Capstones™"
        title={<span><em className="italic text-ancr-dim">Long-form</em> creative theses</span>}
        sub="Multi-semester projects that carry your work from concept to release. Each capstone integrates COHEIR™ mentorship, INHEIRA™ registration, and ANCRLaunch™ readiness."
      />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {list.map((c) => (
          <article key={c.id} data-testid={`capstone-card-${c.id}`} className="group relative overflow-hidden rounded-2xl border border-white/[0.08]">
            <img src={c.cover} className="h-72 w-full object-cover opacity-40 transition duration-700 group-hover:opacity-60 group-hover:scale-[1.03]" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-7">
              <div className="flex items-center gap-2">
                <Chip tone="accent">Capstone™</Chip>
                <Chip>{c.phase}</Chip>
              </div>
              <div>
                <h3 className="font-serif text-3xl leading-tight">{c.title}</h3>
                <div className="mt-3 font-mono text-[11px] text-ancr-dim">
                  Advisor · {c.advisor}{c.industry_reviewer && ` · Industry · ${c.industry_reviewer}`}
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-ancr-mute mb-2">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-[var(--ancra-accent)] shadow-[0_0_10px_var(--ancra-accent-glow)]" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  {c.linked_module && (
                    <Link to={`/hub/${c.linked_module}`} className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">
                      {c.linked_module}™ <ArrowUpRight size={11} />
                    </Link>
                  )}
                  <button className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Open</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
