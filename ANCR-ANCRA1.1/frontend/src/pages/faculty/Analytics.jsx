import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, StatCell } from "@/components/common/Primitives";

export default function Analytics() {
  const { data } = useSWR("/faculty/analytics", get);
  if (!data) return <div className="p-10 font-mono text-[12px] text-ancr-mute">Loading analytics…</div>;

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Cohort Intelligence" title={<span><em className="italic text-ancr-dim">The</em> studio, seen</span>} />

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCell label="Industry Participation" value={`${data.industry_participation}%`} accent />
        <StatCell label="Capstone Readiness" value={`${data.capstone_readiness}%`} />
        <StatCell label="Graduation Readiness" value={`${data.graduation_readiness}%`} />
        <StatCell label="Cohorts" value="3" />
      </div>

      {/* Engagement chart */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Weekly engagement" data={data.engagement} keyX="week" />
        <ChartCard title="Avg portfolio score" data={data.portfolio_score} keyX="month" />
      </div>
    </div>
  );
}

function ChartCard({ title, data, keyX }) {
  const max = Math.max(...data.map((d) => d.value)) + 8;
  return (
    <div className="ancr-card p-6">
      <div className="ancr-label mb-4">{title}</div>
      <div className="flex h-52 items-end gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-gradient-to-t from-[var(--ancra-accent)]/70 to-white/70 transition-all"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d[keyX]}: ${d.value}`}
            />
            <div className="font-mono text-[9px] text-ancr-mute">{d[keyX]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
