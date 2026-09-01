import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gauge, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Ring, Bar } from "@/components/common";

const LINKS = {
  passport: { label: "Passport", to: "/documents" },
  visa: { label: "Visa", to: "/explore/japan" },
  cultural: { label: "Cultural preparation", to: "/culture-school" },
  language: { label: "Language preparation", to: "/translator" },
  health_safety: { label: "Health & safety", to: "/safety" },
  professional: { label: "Professional readiness", to: "/culture-school" },
};

export default function Readiness() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data.readiness)); }, []);
  if (!data) return <Loader label="Calculating readiness" />;

  const rows = Object.keys(LINKS).map((k) => ({ key: k, value: data[k], ...LINKS[k] }));

  return (
    <div data-testid="readiness-page">
      <PageHeader eyebrow="Readiness" title="Your global-readiness score"
        subtitle="A live view of how prepared you are across every dimension of international creative travel."
        testid="readiness-header" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center" data-testid="overall-readiness">
          <Ring value={data.overall} size={140} stroke={12} sub="overall" />
          <div className="mt-4 text-sm text-white/60">{data.checklist_done}/{data.checklist_total} checklist items complete</div>
          <Link to="/travel-ready" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white">Improve readiness <ArrowRight className="h-4 w-4" /></Link>
        </GlassCard>

        <GlassCard className="p-8 lg:col-span-2" data-testid="readiness-breakdown">
          <div className="mb-5 flex items-center gap-2"><Gauge className="h-5 w-5 text-cyan" /><h3 className="font-display text-xl font-600 text-white">Breakdown</h3></div>
          <div className="space-y-5">
            {rows.map((r) => (
              <motion.div key={r.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link to={r.to} className="group block" data-testid={`readiness-row-${r.key}`}>
                  <Bar label={r.label} value={r.value} />
                  <div className="mt-1 text-[11px] text-cyan opacity-0 transition group-hover:opacity-100">Open {r.label} →</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
