import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { ShieldCheck, Award, Music, Video, BookOpen, Users, Plane, Coins } from "lucide-react";

export default function Portfolio() {
  const [p, setP] = useState(null);
  useEffect(() => { api.get("/portfolio").then((r) => setP(r.data)); }, []);
  if (!p) return <div className="p-16 text-white/40 font-mono">Loading portfolio…</div>;
  const id = p.identity || {};

  return (
    <div data-testid="portfolio-page">
      <PageHeader
        eyebrow="Professional Portfolio · Assembled from the Ecosystem"
        title={<>{id.full_name || "Your Portfolio"}</>}
        subtitle={id.biography}
      />
      <Section className="pt-0">
        {/* identity strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCell label="Discipline" value={id.discipline} />
          <StatCell label="Institution" value={id.institution} />
          <StatCell label="Country" value={id.country} />
          <StatCell label="Graduation" value={id.graduation_year} />
        </div>

        {/* Editorial modules */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Creator Passport */}
          {p.creator_passport && (
            <Module title="Creator Passport™" icon={ShieldCheck} span="lg:col-span-6" tid="module-passport">
              <div className="font-mono text-4xl tracking-tighter">{p.creator_passport.passport_id}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(p.creator_passport.verified_credentials || []).map((c) => <TagPill key={c}>{c}</TagPill>)}
              </div>
              <div className="label-eyebrow mt-6 text-[9px]">Issued {p.creator_passport.issued} · Vaulta™</div>
            </Module>
          )}

          {/* Reputation */}
          {p.reputation && (
            <Module title="Professional Reputation" icon={Award} span="lg:col-span-6" tid="module-reputation">
              <div className="flex items-baseline gap-8">
                <div className="font-mono text-6xl tracking-tighter">{p.reputation.score}</div>
                <div>
                  <div className="label-eyebrow">Endorsements</div>
                  <div className="font-mono text-2xl mt-2">{p.reputation.endorsements}</div>
                </div>
              </div>
              <div className="label-eyebrow mt-4 text-[9px]">Updated {p.reputation.last_updated} · COHEIR™</div>
            </Module>
          )}

          {/* Projects */}
          <Module title="Projects · ANCRLAB™" icon={Music} span="lg:col-span-8" tid="module-projects">
            <ul className="divide-y hair border-t hair">
              {(p.projects || []).map((proj, i) => (
                <li key={i} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl">{proj.title}</div>
                    <div className="label-eyebrow text-[9px] mt-1">{proj.role} · {proj.year}</div>
                  </div>
                  <TagPill>{proj.kind}</TagPill>
                </li>
              ))}
              {(p.projects || []).length === 0 && <li className="py-4 text-white/40 text-sm">No projects yet.</li>}
            </ul>
          </Module>

          {/* Media */}
          <Module title="Media · ANCRMEDIA™" icon={Video} span="lg:col-span-4" tid="module-media">
            <ul className="space-y-4">
              {(p.media || []).map((m, i) => (
                <li key={i}>
                  <div className="font-display text-lg leading-tight">{m.title}</div>
                  <div className="label-eyebrow text-[9px] mt-1">{m.medium} · {m.year} · {m.label}</div>
                </li>
              ))}
              {(p.media || []).length === 0 && <li className="text-white/40 text-sm">No releases yet.</li>}
            </ul>
          </Module>

          {/* Publishing */}
          <Module title="Publishing · INHEIRA™" icon={BookOpen} span="lg:col-span-6" tid="module-publishing">
            {(p.publishing || []).map((pub, i) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="text-sm">{pub.work}</div>
                <div className="font-mono text-[11px] text-white/60">{pub.society} · {pub.share}%</div>
              </div>
            ))}
            {(p.publishing || []).length === 0 && <div className="text-white/40 text-sm">No publishing on file.</div>}
          </Module>

          {/* Collaborations */}
          <Module title="Collaborations" icon={Users} span="lg:col-span-6" tid="module-collabs">
            {(p.collaborations || []).map((c, i) => (
              <div key={i} className="py-2 flex items-center justify-between border-t hair first:border-t-0">
                <div className="text-sm">{c.partner}</div>
                <div className="font-mono text-[11px] text-white/60">{c.project} · {c.year}</div>
              </div>
            ))}
            {(p.collaborations || []).length === 0 && <div className="text-white/40 text-sm">No collaborations recorded.</div>}
          </Module>

          {/* Booking */}
          {p.booking_packet && (
            <Module title="Booking Packet™ · ANCRD™" icon={Coins} span="lg:col-span-6" tid="module-booking">
              <div className="grid grid-cols-2 gap-4">
                <StatCell label="Available from" value={p.booking_packet.available_from} />
                <StatCell label="Fee range" value={p.booking_packet.fee_range} />
                <StatCell label="Regions" value={(p.booking_packet.regions || []).join(", ")} />
                <StatCell label="Tech rider" value={p.booking_packet.tech_rider} />
              </div>
            </Module>
          )}

          {/* Travel */}
          {p.travel_readiness && (
            <Module title="Travel Readiness" icon={Plane} span="lg:col-span-6" tid="module-travel">
              <div className="grid grid-cols-2 gap-4">
                <StatCell label="Passport" value={p.travel_readiness.passport} />
                <StatCell label="Vaccinations" value={p.travel_readiness.vaccinations} />
                <StatCell label="Visas" value={(p.travel_readiness.visas || []).join(", ")} />
              </div>
            </Module>
          )}

          {/* Recommendations */}
          <Module title="Faculty Recommendations · ANCRA™" span="lg:col-span-6" tid="module-faculty-recs">
            {(p.faculty_recommendations || []).map((r, i) => (
              <div key={i} className="border-t hair py-4 first:border-t-0">
                <div className="text-sm leading-relaxed">&ldquo;{r.note}&rdquo;</div>
                <div className="label-eyebrow text-[9px] mt-2">{r.from} · {r.year}</div>
              </div>
            ))}
          </Module>
          <Module title="Industry Recommendations · COHEIR™" span="lg:col-span-6" tid="module-industry-recs">
            {(p.industry_recommendations || []).map((r, i) => (
              <div key={i} className="border-t hair py-4 first:border-t-0">
                <div className="text-sm leading-relaxed">&ldquo;{r.note}&rdquo;</div>
                <div className="label-eyebrow text-[9px] mt-2">{r.from} · {r.year}</div>
              </div>
            ))}
          </Module>
        </div>
      </Section>
    </div>
  );
}

function Module({ title, icon: Icon, children, span = "lg:col-span-6", tid }) {
  return (
    <div data-testid={tid} className={`${span} border hair p-8 bg-[#050505]`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon strokeWidth={1.25} className="h-4 w-4 text-white/60" />}
        <div className="label-eyebrow">{title}</div>
      </div>
      {children}
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="border hair p-4">
      <div className="label-eyebrow text-[9px]">{label}</div>
      <div className="font-mono text-sm mt-2">{value || "—"}</div>
    </div>
  );
}
