import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CreatorCard } from "@/components/MediaCards";

const DISCIPLINES = ["", "Songwriter", "Producer", "Vocalist", "Guitarist", "Drummer", "Filmmaker", "Podcaster", "DJ", "Beatmaker", "Composer", "Cinematographer"];

export default function Creators() {
  const [items, setItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filters, setFilters] = useState({ institution: "", discipline: "", country: "" });

  useEffect(() => { api.get("/institutions").then((r) => setInstitutions(r.data)); }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.institution) params.set("institution", filters.institution);
    if (filters.discipline) params.set("discipline", filters.discipline);
    if (filters.country) params.set("country", filters.country);
    api.get(`/creators?${params.toString()}`).then((r) => setItems(r.data));
  }, [filters]);

  const countries = [...new Set(institutions.map((i) => i.country))].sort();

  return (
    <div className="px-8 py-10 pb-24" data-testid="creators-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Global CCDP Creators</div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mt-2">The people behind the network.</h1>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <Select label="Institution" value={filters.institution} onChange={(v) => setFilters({ ...filters, institution: v })} options={[{ value: "", label: "All schools" }, ...institutions.map((i) => ({ value: i.id, label: i.name }))]} testid="filter-institution" />
        <Select label="Discipline" value={filters.discipline} onChange={(v) => setFilters({ ...filters, discipline: v })} options={DISCIPLINES.map((d) => ({ value: d, label: d || "All disciplines" }))} testid="filter-discipline" />
        <Select label="Country" value={filters.country} onChange={(v) => setFilters({ ...filters, country: v })} options={[{ value: "", label: "All countries" }, ...countries.map((c) => ({ value: c, label: c }))]} testid="filter-country" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((c) => <CreatorCard key={c.id} creator={c} />)}
      </div>
      {items.length === 0 && <div className="text-white/40 text-sm py-16 text-center">No creators match those filters.</div>}
    </div>
  );
}

function Select({ label, value, onChange, options, testid }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] tracking-widest uppercase text-white/40">{label}</span>
      <select data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-lg glass border border-white/[0.08] text-[13px] font-sans-alt min-w-[180px]">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-[#0A0A0A]">{o.label}</option>)}
      </select>
    </label>
  );
}
