import React, { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const createIcon = (kind) =>
  L.divIcon({
    className: "leaflet-div-icon",
    html: `<div class="${kind === "inst" ? "ancrd-pin-inst" : "ancrd-pin"}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export default function DiscoverPage() {
  const [users, setUsers] = useState([]);
  const [insts, setInsts] = useState([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    api.get("/users").then(({data})=>setUsers(data));
    api.get("/institutions").then(({data})=>setInsts(data));
  }, []);

  const filtered = useMemo(() => users.filter(u => {
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (country && u.country !== country) return false;
    if (discipline && !u.disciplines?.includes(discipline)) return false;
    if (role && u.role !== role) return false;
    return true;
  }), [users, q, country, discipline, role]);

  const countries = [...new Set(users.map(u=>u.country))].sort();
  const disciplines = [...new Set(users.flatMap(u=>u.disciplines || []))].sort();
  const roles = [...new Set(users.map(u=>u.role))].sort();

  const lines = useMemo(() => {
    // random collaboration lines between institutions
    const arr = [];
    for (let i = 0; i < Math.min(8, insts.length - 1); i++) {
      const a = insts[i]; const b = insts[(i + 3) % insts.length];
      arr.push([[a.lat, a.lng], [b.lat, b.lng]]);
    }
    return arr;
  }, [insts]);

  return (
    <AppShell right={false}>
      <PageHeader
        section="Discover"
        kicker="Global Discovery · Interactive world map"
        description="A living map of verified CCDP creators, institutions, and collaborations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 glass rounded-sm p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Filters</div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-white/30" />
            <input
              data-testid="map-search"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search creators…"
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm text-sm"
            />
          </div>
          <FilterSelect label="Country" value={country} setValue={setCountry} options={countries} testid="filter-country" />
          <FilterSelect label="Discipline" value={discipline} setValue={setDiscipline} options={disciplines} testid="filter-discipline" />
          <FilterSelect label="Role" value={role} setValue={setRole} options={roles} testid="filter-role" />

          <div className="pt-3 border-t border-white/5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Results</div>
            <div className="font-display text-3xl font-black">{filtered.length}</div>
            <div className="font-mono text-[10px] text-white/40">creators matching</div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="rounded-sm overflow-hidden border border-white/10 h-[620px]" data-testid="global-map">
            <MapContainer center={[20, 10]} zoom={2} minZoom={2} scrollWheelZoom={true} style={{height: "100%", width: "100%"}} worldCopyJump>
              <TileLayer
                attribution='&copy; CartoDB'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {lines.map((pts, i) => (
                <Polyline key={i} positions={pts} pathOptions={{ color: "#00E5FF", weight: 1, opacity: 0.35, dashArray: "4,6" }} />
              ))}
              {insts.map((i) => (
                <Marker key={i.id} position={[i.lat, i.lng]} icon={createIcon("inst")}>
                  <Popup>
                    <div className="font-display font-bold text-sm mb-1">{i.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-white/60">{i.city}, {i.country}</div>
                    <div className="mt-2 text-xs">{i.students} students · {i.faculty} faculty</div>
                    <div className="mt-1 text-xs text-white/60">Programs: {i.programs?.slice(0,3).join(", ")}</div>
                  </Popup>
                </Marker>
              ))}
              {filtered.map((u) => (
                <Marker key={u.id} position={[u.lat, u.lng]} icon={createIcon("user")}>
                  <Popup>
                    <div className="flex items-center gap-3 mb-2">
                      <img src={u.avatar} className="h-10 w-10 rounded-sm object-cover" alt="" />
                      <div>
                        <div className="font-display font-bold text-sm">{u.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-white/50">{u.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/70">{u.disciplines?.join(", ")}</div>
                    <div className="text-[10px] text-white/50 mt-1">{u.location}</div>
                    <Link to={`/profile/${u.id}`} className="mt-2 inline-block text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] hover:underline">View Profile →</Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FilterSelect({label, value, setValue, options, testid}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</label>
      <select
        data-testid={testid}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        className="w-full bg-black/40 border border-white/10 focus:border-white/30 outline-none rounded-sm px-3 py-2 text-sm font-mono"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
