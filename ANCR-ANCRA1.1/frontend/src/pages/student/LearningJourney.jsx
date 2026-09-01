import React from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, ExperienceTile, Chip } from "@/components/common/Primitives";
import { Filter } from "lucide-react";

export default function LearningJourney() {
  const { data } = useSWR("/student/journeys", get);
  const nav = useNavigate();
  const [filter, setFilter] = React.useState("all");
  const experiences = data?.experiences || [];

  const kinds = Array.from(new Set(experiences.map((e) => e.kind)));
  const filtered = filter === "all" ? experiences : experiences.filter((e) => e.kind === filter);

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Learning Journey™"
        title={<span><em className="italic text-ancr-dim">Your</em> Studio Experiences™</span>}
        sub="The Contemporary Creative Development Program is a curated path through experiences — not a course catalog. Each experience is authored by a working professional and integrated across the ANCR ecosystem."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Filter size={13} className="text-ancr-dim mr-1" />
        {["all", ...kinds].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            data-testid={`filter-${k.replace(/[^a-z]/gi, "-").toLowerCase()}`}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              filter === k
                ? "border-white bg-white text-black"
                : "border-white/10 text-ancr-dim hover:border-white/30 hover:text-white"
            }`}
          >{k === "all" ? "All experiences" : k}</button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exp) => (
          <ExperienceTile key={exp.id} exp={exp} onClick={() => nav(`/experience/${exp.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center font-mono text-[12px] text-ancr-mute">
          No experiences match this filter.
        </div>
      )}
    </div>
  );
}
