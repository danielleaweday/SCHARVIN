import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { Search } from "lucide-react";

export default function Students() {
  const { data } = useSWR("/faculty/students", get);
  const students = data?.students || [];
  const [q, setQ] = React.useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Roster" title="Students" />
      <div className="mt-8 flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 max-w-md">
        <Search size={13} className="text-ancr-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search students…"
          data-testid="student-search"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ancr-mute"
        />
      </div>

      <div className="mt-8 ancr-card overflow-hidden">
        <div className="grid grid-cols-12 border-b border-white/[0.06] px-5 py-3 font-mono text-[9px] uppercase tracking-widest text-ancr-mute">
          <div className="col-span-4">Student</div>
          <div className="col-span-3">Cohort</div>
          <div className="col-span-3">Concentration</div>
          <div className="col-span-1 text-right">Portfolio</div>
          <div className="col-span-1 text-right">Grad</div>
        </div>
        {filtered.map((s) => (
          <div key={s.id} className="grid grid-cols-12 items-center border-b border-white/[0.04] px-5 py-4 hover:bg-white/[0.02] transition">
            <div className="col-span-4 flex items-center gap-3">
              {s.avatar && <img src={s.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />}
              <div>
                <div className="font-serif text-[15px]">{s.name}</div>
                {s.year && <div className="font-mono text-[10px] text-ancr-mute">{s.year}</div>}
              </div>
            </div>
            <div className="col-span-3 font-mono text-[11px] text-ancr-dim">{s.cohort}</div>
            <div className="col-span-3 text-[12px] text-ancr-dim">{s.concentration}</div>
            <div className="col-span-1 text-right font-mono text-[13px]">{s.portfolio_score}</div>
            <div className="col-span-1 text-right font-mono text-[13px]">{s.graduation_readiness ?? "—"}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
