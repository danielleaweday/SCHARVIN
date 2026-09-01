import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";

const HERO = {
  job: {
    eyebrow: "Curated Roles · Verified Employers",
    title: <>Executive career openings for verified creators.</>,
    subtitle: "Roles from Meridian Records, Northlight Publishing, Aurora Creative Group, Halcyon Studios and every verified employer in the ANCR network.",
  },
  internship: {
    eyebrow: "Institutional Pathways",
    title: <>Internships that <span className="grad-text">become careers.</span></>,
    subtitle: "Signed placements curated across music, film, animation, media, publishing, production, and creative agencies.",
  },
  audition: {
    eyebrow: "Casting · Live · Confidential",
    title: <>Auditions for the ANCR<br />verified creator network.</>,
    subtitle: "Broadway revivals, world tours, session vocals, voiceover, film, television — every opportunity vetted through the ecosystem.",
  },
  project: {
    eyebrow: "Commissions · Camps · Sync",
    title: <>Projects that expand your <span className="grad-text">verified portfolio.</span></>,
    subtitle: "Writing camps, film scores, sync briefs, live events and creative commissions from ANCRSync™ and industry partners.",
  },
};

export default function OpportunityList({ kind }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [remote, setRemote] = useState(null);

  const load = () => {
    const params = { kind };
    if (q) params.q = q;
    if (country) params.country = country;
    if (remote !== null) params.remote = remote;
    api.get("/opportunities", { params }).then((r) => setItems(r.data));
  };

  useEffect(() => { load(); }, [kind, country, remote]);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const meta = HERO[kind];

  const apply = async (opp) => {
    try {
      await api.post("/applications", { opportunity_id: opp.id });
      toast.success(`Applied — ${opp.title}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to apply");
    }
  };

  return (
    <div data-testid={`opportunities-${kind}`}>
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        subtitle={meta.subtitle}
      />
      <Section className="pt-0">
        {/* filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <input
            data-testid="filter-q"
            placeholder="Search title, employer, keyword"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={load}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="flex-1 bg-transparent border-b hair-strong py-3 focus:outline-none focus:border-[#00f0ff] transition-colors font-body"
          />
          <select
            data-testid="filter-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-[#050505] border hair px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            <option value="">All countries</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Japan</option>
            <option>Global</option>
          </select>
          <select
            data-testid="filter-remote"
            value={remote === null ? "" : remote ? "true" : "false"}
            onChange={(e) => setRemote(e.target.value === "" ? null : e.target.value === "true")}
            className="bg-[#050505] border hair px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            <option value="">Remote & On-site</option>
            <option value="true">Remote only</option>
            <option value="false">On-site only</option>
          </select>
        </div>

        {/* category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c) => (
              <TagPill key={c}>{c}</TagPill>
            ))}
          </div>
        )}

        {/* editorial listings */}
        <ul className="border-t hair">
          {items.map((o) => (
            <li key={o.id} className="group border-b hair py-10 md:py-12 flex flex-col md:flex-row md:items-center gap-6" data-testid={`opp-${o.id}`}>
              <div className="flex-1 min-w-0">
                <div className="label-eyebrow text-[9px]">{o.category} · {o.country}{o.remote ? " · Remote" : ""}</div>
                <div className="font-display text-3xl md:text-5xl leading-[0.95] mt-3 group-hover:grad-text transition-colors">
                  {o.title}
                </div>
                <div className="mt-3 text-white/60 text-sm md:text-base">
                  <span className="font-mono uppercase tracking-[0.2em] text-[11px] mr-3">{o.employer}</span>
                  {o.location}
                </div>
                <p className="mt-4 max-w-2xl text-white/60 leading-relaxed text-sm">{o.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(o.tags || []).map((t) => <TagPill key={t}>{t}</TagPill>)}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 md:min-w-[220px]">
                {o.compensation && <div className="font-mono text-lg tracking-tighter">{o.compensation}</div>}
                <button
                  data-testid={`apply-${o.id}`}
                  onClick={() => apply(o)}
                  className="inline-flex items-center gap-2 px-6 py-3 border hair-strong hover:bg-white/5 transition-colors font-mono text-[11px] uppercase tracking-[0.24em]"
                >
                  Apply <ArrowUpRight strokeWidth={1.5} className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="py-16 text-center text-white/40">No opportunities match your filters.</li>}
        </ul>
      </Section>
    </div>
  );
}
