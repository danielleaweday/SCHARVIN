import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section } from "@/components/Bits";

const LABELS = {
  portfolio: "Portfolio",
  publishing: "Publishing Activity",
  creative_projects: "Creative Projects",
  collaboration: "Collaboration History",
  faculty: "Faculty Recommendations",
  industry: "Industry Recommendations",
  reputation: "Professional Reputation",
  resume: "Resume Completion",
  interview: "Interview Readiness",
  business: "Business Readiness",
};

export default function Readiness() {
  const [r, setR] = useState(null);
  useEffect(() => { api.get("/readiness").then((res) => setR(res.data)); }, []);
  if (!r) return <div className="p-16 text-white/40 font-mono">Loading readiness…</div>;

  return (
    <div data-testid="readiness-page">
      <PageHeader
        eyebrow="Career Readiness™"
        title={<>Every signal.<br /><span className="grad-text">Weighted, verified, live.</span></>}
        subtitle="Assembled in real time from every verified record in the ANCR ecosystem — never duplicated, never manually entered."
      />
      <Section className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 border hair p-12 bg-[#050505] glow-ring">
            <div className="label-eyebrow">Overall Score</div>
            <div className="font-mono text-[120px] leading-none mt-6 tracking-tighter">{r.overall}</div>
            <div className="grad-text font-display text-3xl mt-4">{r.tier}</div>
            <p className="mt-8 text-white/60 leading-relaxed text-sm">
              Every 5 points closer to 100 unlocks a new tier of opportunity access, employer visibility, and AIAH™ coaching depth.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-1">
            {Object.entries(r.components).map(([k, v]) => (
              <ReadinessRow key={k} label={LABELS[k] || k} value={v} weight={r.weights[k]} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function ReadinessRow({ label, value, weight }) {
  return (
    <div className="border hair p-6 bg-[#050505] hover:border-white/20 transition-colors">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-display text-xl">{label}</div>
          <div className="label-eyebrow mt-1 text-[9px]">Weight {(weight * 100).toFixed(0)}%</div>
        </div>
        <div className="font-mono text-2xl tracking-tighter">{value}</div>
      </div>
      <div className="h-[2px] bg-white/5 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 grad-stroke"
          style={{ width: `${value}%`, transition: "width 800ms ease" }}
        />
      </div>
    </div>
  );
}
