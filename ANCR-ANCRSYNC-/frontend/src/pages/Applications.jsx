import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { toast } from "sonner";

const STAGES = ["applied", "interview", "offer", "accepted", "declined", "archived"];

export default function Applications() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/applications").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const setStage = async (id, stage) => {
    try {
      await api.patch(`/applications/${id}`, { stage });
      toast.success(`Moved to ${stage}`);
      load();
    } catch { toast.error("Failed to update"); }
  };

  const grouped = STAGES.map((s) => ({ stage: s, items: items.filter((i) => i.stage === s) }));

  return (
    <div data-testid="applications-page">
      <PageHeader
        eyebrow="Applications · Pipeline"
        title={<>Every application. <span className="grad-text">Every stage.</span></>}
        subtitle="Track opportunities from application to offer without leaving ANCRLaunch. Stages update automatically as employers respond."
      />
      <Section className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {grouped.map(({ stage, items }) => (
            <div key={stage} className="border hair p-4 bg-[#050505] min-h-[300px]" data-testid={`stage-${stage}`}>
              <div className="flex items-baseline justify-between mb-4">
                <div className="label-eyebrow">{stage}</div>
                <div className="font-mono text-lg">{items.length}</div>
              </div>
              <div className="space-y-3">
                {items.map((a) => (
                  <div key={a.id} className="border hair p-4 hover:border-white/25 transition-colors" data-testid={`app-${a.id}`}>
                    <div className="text-sm font-display leading-tight">{a.opportunity_title}</div>
                    <div className="label-eyebrow text-[9px] mt-2">{a.employer}</div>
                    <select
                      value={a.stage}
                      onChange={(e) => setStage(a.id, e.target.value)}
                      className="mt-3 w-full bg-transparent border-b hair-strong py-1 text-[11px] font-mono uppercase tracking-[0.2em] focus:outline-none"
                    >
                      {STAGES.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                    </select>
                  </div>
                ))}
                {items.length === 0 && <TagPill>None</TagPill>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
