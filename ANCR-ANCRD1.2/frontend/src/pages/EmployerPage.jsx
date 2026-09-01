import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { Search, BookmarkPlus, BookmarkCheck, Send, MapPin, Star, CheckCircle2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { ReputationRow } from "@/components/ancrd/ReputationBadge";

export default function EmployerPage() {
  const [users, setUsers] = useState([]);
  const [saved, setSaved] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [availability, setAvailability] = useState("");
  const [country, setCountry] = useState("");
  const [minPortfolio, setMinPortfolio] = useState(60);
  const [count, setCount] = useState(0);

  const search = async () => {
    const { data } = await api.post("/employer/search", {
      q, role, discipline, availability, country,
      min_portfolio: minPortfolio,
    });
    setUsers(data.results);
    setCount(data.count);
  };

  const loadSaved = () => api.get("/employer/saved").then(({ data }) => setSaved(data));

  useEffect(() => { search(); loadSaved(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { const t = setTimeout(search, 200); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q, role, discipline, availability, country, minPortfolio]);

  const savedIds = useMemo(() => new Set(saved.map((s) => s.id)), [saved]);

  const toggleSave = async (u) => {
    if (savedIds.has(u.id)) {
      await api.delete(`/employer/saved/${u.id}`);
      toast.success(`Removed ${u.name}`);
    } else {
      await api.post(`/employer/saved/${u.id}`);
      toast.success(`Saved ${u.name}`);
    }
    loadSaved();
  };

  // Distinct filter values (from initial results, keep list stable)
  const roles = ["Student", "Alumni", "Faculty", "Professor", "Mentor", "Industry Partner", "Recruiter"];
  const disciplines = ["Songwriting", "Music Production", "Film Composition", "Audio Engineering",
    "Photography", "Graphic Design", "Animation", "Dance", "Fashion", "Publishing",
    "Cinematography", "Sound Design", "Visual Art", "Creative Direction"];
  const availabilities = ["Open", "Booking", "Selective", "Unavailable"];

  return (
    <AppShell>
      <PageHeader
        section="Employer Mode"
        kicker="Search verified creative talent across the CCDP network"
        description="Filter by discipline, availability, geography, and portfolio strength. Save shortlists. Contact directly."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters + saved */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass rounded-sm p-4 space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Filters</div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-white/30" />
              <input
                data-testid="employer-search"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder="Search name / bio…"
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm text-sm"
              />
            </div>
            <Select label="Role" value={role} setValue={setRole} options={roles} testid="employer-role" />
            <Select label="Discipline" value={discipline} setValue={setDiscipline} options={disciplines} testid="employer-discipline" />
            <Select label="Availability" value={availability} setValue={setAvailability} options={availabilities} testid="employer-availability" />
            <Select label="Country" value={country} setValue={setCountry} options={["USA","UK","Japan","Germany","Nigeria","France","Brazil","India","South Korea","Canada","Australia"]} testid="employer-country" />
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">Min Portfolio {minPortfolio}</label>
              <input
                data-testid="employer-min-portfolio"
                type="range" min="0" max="100" value={minPortfolio}
                onChange={(e)=>setMinPortfolio(parseInt(e.target.value))}
                className="w-full accent-[#F97316]"
              />
            </div>
          </div>

          <div className="glass rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Saved</div>
              <div className="font-mono text-[10px] text-white/40">{saved.length}</div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {saved.length === 0 && <div className="text-white/40 text-xs">No saved candidates yet.</div>}
              {saved.map((u) => (
                <Link key={u.id} to={`/profile/${u.id}`} data-testid={`saved-${u.id}`} className="flex items-center gap-2 p-1 -mx-1 rounded-sm hover:bg-white/[0.03] btn-cine">
                  <img src={u.avatar} className="h-8 w-8 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-xs truncate">{u.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 truncate">{u.role}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Talent results */}
        <div className="lg:col-span-9">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
            {count} verified {count === 1 ? "creator" : "creators"} matching
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
            {users.map((u) => (
              <div key={u.id} data-testid={`talent-${u.id}`} className="glass rounded-sm p-4 flex gap-4">
                <img src={u.avatar} className="h-16 w-16 rounded-sm object-cover shrink-0" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/profile/${u.id}`} className="font-display font-bold text-base truncate hover:underline">{u.name}</Link>
                        {u.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#F97316" }} />}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 truncate">{u.role} · {u.institution}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-black text-xl" style={{ color: "#F97316" }}>{u.portfolio_score}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Portfolio</div>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {u.city}, {u.country}</span>
                    <span>· {u.availability}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(u.disciplines || []).slice(0, 3).map((d) => (
                      <span key={d} className="px-1.5 py-0.5 border border-white/10 rounded-sm font-mono text-[9px] uppercase tracking-widest text-white/70">{d}</span>
                    ))}
                  </div>
                  {u.reputation?.length > 0 && (
                    <div className="mt-2">
                      <ReputationRow badges={u.reputation.slice(0, 2)} />
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => toggleSave(u)}
                      data-testid={`talent-save-${u.id}`}
                      className={`px-2.5 py-1 border rounded-sm font-mono text-[10px] uppercase tracking-widest btn-cine ${savedIds.has(u.id) ? "border-[#F97316]/60 text-[#F97316]" : "border-white/15 hover:border-white/30"}`}
                    >
                      {savedIds.has(u.id) ? (
                        <span className="inline-flex items-center gap-1"><BookmarkCheck className="h-3 w-3" /> Saved</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><BookmarkPlus className="h-3 w-3" /> Save</span>
                      )}
                    </button>
                    <Link
                      to={`/messages`}
                      data-testid={`talent-contact-${u.id}`}
                      className="px-2.5 py-1 border border-white/15 hover:border-white/30 btn-cine rounded-sm font-mono text-[10px] uppercase tracking-widest inline-flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Contact
                    </Link>
                    <Link
                      to={`/profile/${u.id}`}
                      data-testid={`talent-view-${u.id}`}
                      className="px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-widest text-white btn-cine"
                      style={{ background: "linear-gradient(90deg, #4F46E5, #A855F7, #EC4899, #F97316)" }}
                    >
                      View Portfolio
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {users.length === 0 && (
            <div className="glass rounded-sm p-8 text-center text-white/50 text-sm">
              No candidates match. Loosen filters to expand the pool.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Select({label, value, setValue, options, testid}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</label>
      <select
        data-testid={testid}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        className="w-full bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-2 text-sm font-mono"
      >
        <option value="">Any</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
