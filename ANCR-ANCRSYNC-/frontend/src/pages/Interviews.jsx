import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { CalendarClock, Link as LinkIcon } from "lucide-react";

export default function Interviews() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/interviews").then((r) => setItems(r.data)); }, []);

  return (
    <div data-testid="interviews-page">
      <PageHeader
        eyebrow="Interviews · Calendar & Prep"
        title={<>Prepared. <span className="grad-text">Composed.</span> Confident.</>}
        subtitle="Every upcoming interview with meeting links, preparation notes, and post-interview follow-up tracking."
      />
      <Section className="pt-0">
        <div className="space-y-6">
          {items.map((i) => (
            <div key={i.id} data-testid={`interview-${i.id}`} className="border hair p-8 md:p-10 bg-[#050505] grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="label-eyebrow">{i.status}</div>
                <div className="font-display text-3xl mt-3 leading-tight">{i.role}</div>
                <div className="text-white/60 text-sm mt-2">{i.employer}</div>
                <div className="mt-4 font-mono text-sm flex items-center gap-2">
                  <CalendarClock strokeWidth={1.25} className="h-4 w-4" />
                  {new Date(i.when).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="label-eyebrow mb-3">Preparation Notes</div>
                <p className="text-white/70 text-sm leading-relaxed">{i.prep_notes || "—"}</p>
              </div>
              <div>
                <div className="label-eyebrow mb-3">Meeting</div>
                {i.meeting_link ? (
                  <a href={i.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border hair-strong px-4 py-2 hover:bg-white/5 transition-colors font-mono text-[11px] uppercase tracking-[0.24em]">
                    <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.25} /> Join
                  </a>
                ) : <TagPill>No link yet</TagPill>}
                <div className="label-eyebrow mt-6 mb-3">Follow-up</div>
                <p className="text-white/70 text-sm">{i.follow_up || "Send thank-you within 24 hours."}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="py-16 text-center text-white/40">No interviews scheduled.</div>}
        </div>
      </Section>
    </div>
  );
}
