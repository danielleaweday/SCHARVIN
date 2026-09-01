import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, Metric } from "@/components/Bits";

const LABELS = {
  employment: "Employment",
  publishing_deal: "Publishing Deals",
  management: "Management",
  graduate_school: "Graduate School",
  entrepreneurship: "Entrepreneurship",
  touring: "Touring",
  creative_business: "Creative Business",
};

export default function GraduateOutcomes() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/graduate-outcomes").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="p-16 text-white/40 font-mono">Loading outcomes…</div>;

  return (
    <div data-testid="outcomes-page">
      <PageHeader
        eyebrow="Placement · Verified Outcomes"
        title={<>Where <span className="grad-text">verified creators</span> launched.</>}
        subtitle="Every outcome below is confirmed by ANCRID™ and cross-signed by faculty or industry partners."
      />
      <Section className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Metric label="Total Outcomes" value={data.total} sub="Verified" testid="metric-total-outcomes" />
          {Object.entries(data.stats).slice(0, 3).map(([k, v]) => (
            <Metric key={k} label={LABELS[k] || k} value={v} testid={`metric-outcome-${k}`} />
          ))}
        </div>

        <ul className="border-t hair">
          {data.outcomes.map((o) => (
            <li key={o.id} data-testid={`outcome-${o.id}`} className="border-b hair py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="label-eyebrow text-[9px]">{LABELS[o.outcome_type] || o.outcome_type} · {o.year}</div>
                <div className="font-display text-3xl mt-3 leading-tight">{o.creator_name}</div>
                <div className="text-white/60 text-sm mt-2">{o.discipline} · {o.institution}</div>
              </div>
              <div className="md:col-span-2">
                <div className="font-display text-xl">{o.headline}</div>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">{o.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
