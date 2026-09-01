import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section, TagPill } from "@/components/Bits";
import { useAuth } from "@/context/AuthContext";

export default function EmployerNetwork() {
  const { user } = useAuth();
  const [tab, setTab] = useState("employers");
  const [employers, setEmployers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [f, setF] = useState({ discipline: "", country: "", institution: "", min_readiness: "" });

  useEffect(() => {
    api.get("/employers").then((r) => setEmployers(r.data));
  }, []);

  const searchCandidates = () => {
    const params = {};
    Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
    api.get("/employers/candidates", { params })
      .then((r) => setCandidates(r.data))
      .catch(() => setCandidates([]));
  };

  const canSearch = ["employer", "recruiter", "industry_partner", "career_services", "administrator", "faculty"].includes(user?.role);

  return (
    <div data-testid="employer-network-page">
      <PageHeader
        eyebrow="Employer Network · Verified Only"
        title={<>The private roster of<br /><span className="grad-text">the ANCR ecosystem.</span></>}
        subtitle="Verified employers and recruiters search verified creators — every profile is assembled live from ANCRID™, Vaulta™, ANCRLAB™, ANCRMEDIA™, INHEIRA™ and COHEIR™."
      />
      <Section className="pt-0">
        <div className="flex gap-2 mb-8">
          <TabBtn active={tab === "employers"} onClick={() => setTab("employers")} tid="tab-employers">Verified Employers</TabBtn>
          {canSearch && (
            <TabBtn active={tab === "candidates"} onClick={() => { setTab("candidates"); searchCandidates(); }} tid="tab-candidates">
              Search Creators
            </TabBtn>
          )}
        </div>

        {tab === "employers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employers.map((e) => (
              <div key={e.id} data-testid={`employer-${e.id}`} className="border hair p-8 bg-[#050505] hover:border-white/25 transition-colors">
                <div className="label-eyebrow text-[9px]">{e.industry} · {e.country}</div>
                <div className="font-display text-3xl mt-3 leading-tight">{e.name}</div>
                <p className="mt-4 text-white/60 text-sm leading-relaxed">{e.about}</p>
                <div className="mt-6 flex items-center justify-between">
                  <TagPill>Verified ANCR</TagPill>
                  {e.website && <span className="font-mono text-[10px] text-white/40">{e.website.replace("https://", "")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "candidates" && canSearch && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <FInput label="Discipline" v={f.discipline} on={(v) => setF({ ...f, discipline: v })} tid="filter-discipline" />
              <FInput label="Country" v={f.country} on={(v) => setF({ ...f, country: v })} tid="filter-c-country" />
              <FInput label="Institution" v={f.institution} on={(v) => setF({ ...f, institution: v })} tid="filter-institution" />
              <FInput label="Min Readiness" v={f.min_readiness} on={(v) => setF({ ...f, min_readiness: v })} tid="filter-min-readiness" />
            </div>
            <button
              data-testid="btn-search-candidates"
              onClick={searchCandidates}
              className="mb-8 inline-flex items-center gap-2 px-6 py-3 border hair-strong hover:bg-white/5 transition-colors font-mono text-[11px] uppercase tracking-[0.24em]"
            >
              Search Verified Creators
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((c) => (
                <div key={c.ancrid} data-testid={`candidate-${c.ancrid}`} className="border hair p-8 bg-[#050505]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="label-eyebrow text-[9px]">{c.discipline}</div>
                      <div className="font-display text-2xl mt-2">{c.full_name}</div>
                      <div className="text-white/60 text-sm mt-1">{c.institution} · {c.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-3xl tracking-tighter grad-text">{c.readiness_overall}</div>
                      <div className="label-eyebrow text-[9px] mt-1">{c.readiness_tier}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-white/60 text-sm leading-relaxed">{c.biography}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="font-mono text-[11px] text-white/50">Reputation {c.reputation_score}</div>
                    <TagPill>ANCRID {c.ancrid}</TagPill>
                  </div>
                </div>
              ))}
              {candidates.length === 0 && <div className="text-white/40 py-8">No verified creators match. Try broadening filters.</div>}
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

function TabBtn({ active, onClick, children, tid }) {
  return (
    <button
      data-testid={tid}
      onClick={onClick}
      className={`px-6 py-3 border transition-colors font-mono text-[11px] uppercase tracking-[0.24em]
        ${active ? "border-white text-white bg-white/[0.05]" : "hair text-white/60 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function FInput({ label, v, on, tid }) {
  return (
    <div>
      <div className="label-eyebrow mb-2 text-[9px]">{label}</div>
      <input
        data-testid={tid}
        value={v}
        onChange={(e) => on(e.target.value)}
        className="w-full bg-transparent border-b hair-strong py-2 focus:outline-none focus:border-[#00f0ff] transition-colors font-body text-sm"
      />
    </div>
  );
}
