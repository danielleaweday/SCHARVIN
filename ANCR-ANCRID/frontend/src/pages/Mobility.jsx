import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { toast } from "sonner";
import {
  Plane, Hotel, Car, Utensils, HeartPulse, PhoneCall, Users, ScrollText,
  Wrench, FileText, Globe2, Calendar, Sparkles, Lock, Package, Copy, Check,
  ExternalLink, ShieldCheck, Trash2, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  { key: "personal",   label: "Personal",     icon: Plane },
  { key: "programs",   label: "Programs",     icon: Hotel },
  { key: "preferences",label: "Preferences",  icon: Wrench },
  { key: "dietary",    label: "Dietary",      icon: Utensils },
  { key: "medical",    label: "Medical",      icon: HeartPulse },
  { key: "emergency",  label: "Emergency",    icon: PhoneCall },
  { key: "team",       label: "Team",         icon: Users },
  { key: "booking",    label: "Booking",      icon: ScrollText },
  { key: "riders",     label: "Riders",       icon: Wrench },
  { key: "documents",  label: "Documents",    icon: FileText },
  { key: "history",    label: "Global History",icon: Globe2 },
  { key: "calendar",   label: "Calendar",     icon: Calendar },
  { key: "ai",         label: "AI Assistant", icon: Sparkles },
  { key: "permissions",label: "Permissions",  icon: Lock },
  { key: "packet",     label: "Booking Packet", icon: Package },
];

export default function Mobility() {
  const [tab, setTab] = useState("personal");
  const [data, setData] = useState(null);
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    api.get("/mobility/profile").then(r => setData(r.data)).catch(() => {});
    api.get("/mobility/booking-packets").then(r => setPackets(r.data.items)).catch(() => {});
  }, []);

  if (!data) return <div />;

  return (
    <div className="space-y-8" data-testid="mobility-page">
      <SectionTitle
        eyebrow="Creator Mobility™"
        title="Your professional travel & booking record."
        testid="mobility-title"
      />

      {/* Tabs */}
      <div className="glass rounded-3xl p-3 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              data-testid={`mobility-tab-${s.key}`}
              onClick={() => setTab(s.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono uppercase tracking-[0.16em] transition-all ${
                tab === s.key
                  ? "bg-white/[0.08] text-white border border-white/15"
                  : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <s.icon size={13} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "personal"    && <Personal    m={data} />}
      {tab === "programs"    && <Programs    m={data} />}
      {tab === "preferences" && <Preferences m={data} />}
      {tab === "dietary"     && <Dietary     m={data} />}
      {tab === "medical"     && <Medical     m={data} />}
      {tab === "emergency"   && <Emergency   m={data} />}
      {tab === "team"        && <Team        m={data} />}
      {tab === "booking"     && <Booking     m={data} />}
      {tab === "riders"      && <Riders      m={data} />}
      {tab === "documents"   && <Documents   m={data} />}
      {tab === "history"     && <History     m={data} />}
      {tab === "calendar"    && <Cal         m={data} />}
      {tab === "ai"          && <AI          m={data} />}
      {tab === "permissions" && <Permissions m={data} />}
      {tab === "packet"      && <Packet      packets={packets} onRefresh={() => api.get("/mobility/booking-packets").then(r => setPackets(r.data.items))} />}
    </div>
  );
}

/* -------- Panels -------- */

function Panel({ title, children, right }) {
  return (
    <section className="glass rounded-3xl p-7">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">{title}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

function KV({ k, v, mono, wide, tint }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">{k}</div>
      <div className={`${mono ? "font-mono" : ""} text-sm mt-1`} style={{ color: tint || "#fff" }}>{v || "—"}</div>
    </div>
  );
}

function Chip({ children, tint }) {
  return (
    <span
      className="text-xs bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5"
      style={{ color: tint || "rgba(255,255,255,0.85)" }}
    >
      {children}
    </span>
  );
}

function Personal({ m }) {
  const p = m.personal;
  return (
    <Panel title="Personal Travel Profile">
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-5">
        <KV k="Preferred Name" v={p.preferred_name} />
        <KV k="Legal Name (Passport)" v={p.legal_name} />
        <KV k="Date of Birth" v={p.date_of_birth} mono />
        <KV k="Nationality" v={p.nationality} />
        <KV k="Citizenships" v={p.citizenships.join(", ")} />
        <KV k="Passport №" v={p.passport_number_masked} mono />
        <KV k="Passport Expiration" v={p.passport_expiration} mono />
        <KV k="TSA PreCheck" v={p.tsa_precheck} mono />
        <KV k="Global Entry" v={p.global_entry} mono />
        <KV k="Known Traveler №" v={p.known_traveler_number} mono />
      </div>
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-3">Visas on File</div>
        <div className="divide-y divide-white/5">
          {p.visas.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 py-3">
              <div className="text-white text-sm">{v.country}</div>
              <div className="text-white/70 text-sm">{v.type}</div>
              <div className="font-mono text-xs tracking-[0.18em] text-white/50 uppercase text-right">Expires {v.expires}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Programs({ m }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="Airlines">
        <div className="space-y-3">
          {m.airlines.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border border-white/5 rounded-2xl px-4 py-3">
              <div className="min-w-0">
                <div className="text-white text-sm">{a.airline}</div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50 mt-0.5">{a.alliance}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[11px] text-white/80">{a.number}</div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e5ff] mt-0.5">{a.status}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Hotels">
        <div className="space-y-3">
          {m.hotels.map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border border-white/5 rounded-2xl px-4 py-3">
              <div>
                <div className="text-white text-sm">{h.program}</div>
                <div className="font-mono text-[11px] text-white/60 mt-0.5">{h.number}</div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8a2be2]">{h.status}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Rental Cars">
        <div className="space-y-3">
          {m.rentals.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border border-white/5 rounded-2xl px-4 py-3">
              <div>
                <div className="text-white text-sm">{r.company}</div>
                <div className="font-mono text-[11px] text-white/60 mt-0.5">{r.number}</div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff6d00]">{r.status}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Preferences({ m }) {
  const p = m.preferences;
  return (
    <Panel title="Travel Preferences">
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-5">
        <KV k="Preferred Seat" v={p.seat} />
        <KV k="Preferred Cabin" v={p.cabin} />
        <KV k="Home Airport" v={p.home_airport} mono />
        <KV k="Preferred Airlines" v={p.airlines.join(" · ")} wide />
        <KV k="Preferred Hotel Brands" v={p.hotel_brands.join(" · ")} />
        <KV k="Preferred Rental" v={p.rental} />
        <KV k="Ground Transport" v={p.ground_transport.join(" · ")} wide />
      </div>
    </Panel>
  );
}

function Dietary({ m }) {
  const d = m.dietary;
  return (
    <Panel title="Food & Dietary">
      <div className="space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Restrictions</div>
          <div className="flex flex-wrap gap-2">{d.restrictions.map(r => <Chip key={r} tint="#ff6d00">{r}</Chip>)}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Favorites</div>
            <div className="flex flex-wrap gap-2">{d.favorites.map(x => <Chip key={x}>{x}</Chip>)}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Avoid</div>
            <div className="flex flex-wrap gap-2">{d.avoid.map(x => <Chip key={x} tint="#ff3b30">{x}</Chip>)}</div>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Meal Preferences</div>
          <div className="text-white/80 text-sm">{d.meal_preferences}</div>
        </div>
      </div>
    </Panel>
  );
}

function Medical({ m }) {
  const md = m.medical;
  return (
    <Panel
      title="Medical Information"
      right={<span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-full px-2.5 py-1"><Lock size={11}/>Private</span>}
    >
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        <KV k="Medical Conditions" v={md.conditions} />
        <KV k="Medications" v={md.medications} />
        <KV k="Mobility" v={md.mobility} />
        <KV k="Accessibility" v={md.accessibility} />
        <KV k="Emergency Physician" v={md.physician} wide />
        <KV k="Insurance Provider" v={md.insurance_provider} />
        <KV k="Insurance №" v={md.insurance_number_masked} mono />
      </div>
    </Panel>
  );
}

function Emergency({ m }) {
  return (
    <Panel title="Emergency Contacts" right={<PrivateBadge />}>
      <div className="space-y-3">
        {m.emergency.map((c, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-3 border border-white/5 rounded-2xl px-5 py-4">
            <div>
              <div className="text-white text-base">{c.name}</div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">{c.relation}</div>
            </div>
            <div className="font-mono text-sm text-white/80">{c.phone}</div>
            <div className="text-white/70 text-sm md:col-span-2">{c.email}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Team({ m }) {
  const t = m.team;
  const rows = [
    ["Manager", t.manager],
    ["Tour Manager", t.tour_manager],
    ["Attorney", t.attorney],
    ["Merch Manager", t.merch_manager],
    ["Production", t.production],
    ["FOH Engineer", t.foh],
    ["Monitor Engineer", t.monitors],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Team">
        <div className="divide-y divide-white/5">
          {rows.map(([role, c]) => (
            <div key={role} className="grid grid-cols-3 gap-4 py-3">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{role}</div>
              <div className="text-white text-sm">{c.name}</div>
              <div className="font-mono text-xs text-white/70 text-right">{c.phone || "—"}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Band & Crew">
        <div className="mb-4">
          <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Band</div>
          <div className="flex flex-wrap gap-2">{t.band.map(b => <Chip key={b}>{b}</Chip>)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Crew</div>
          <div className="flex flex-wrap gap-2">{t.crew.map(b => <Chip key={b}>{b}</Chip>)}</div>
        </div>
      </Panel>
    </div>
  );
}

function Booking({ m }) {
  const b = m.booking;
  return (
    <Panel title="Booking Information">
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        <KV k="Booking Agent" v={b.agent.name} />
        <KV k="Agent Contact" v={`${b.agent.phone} · ${b.agent.email}`} mono />
        <KV k="Management" v={b.management} />
        <KV k="Label" v={b.label} />
        <KV k="Publisher" v={b.publisher} />
        <KV k="Performance Fee" v={b.fee_range} tint="#ff6d00" />
        <KV k="Travel Buyout" v={b.travel_buyout} />
      </div>
    </Panel>
  );
}

function Riders({ m }) {
  const r = m.riders;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Hospitality Rider">
        <div className="text-white/80 text-sm leading-relaxed">{r.hospitality}</div>
      </Panel>
      <Panel title="Technical Rider">
        <div className="text-white/80 text-sm leading-relaxed">{r.technical}</div>
      </Panel>
      <Panel title="Stage Plot">
        <div className="text-white/60 text-sm">{r.stage_plot}</div>
      </Panel>
      <Panel title="Input List">
        <div className="text-white/80 text-sm">{r.input_list}</div>
      </Panel>
      <div className="lg:col-span-2">
        <Panel title="Advance Notes">
          <div className="text-white/80 text-sm">{r.advance_notes}</div>
        </Panel>
      </div>
    </div>
  );
}

function Documents({ m }) {
  return (
    <Panel title="Travel Documents">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {m.documents.map(d => (
          <div key={d.id} className="border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
            <FileText size={14} className={d.private ? "text-[#ff6d00]" : "text-[#00e5ff]"} />
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm truncate">{d.name}</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/40 mt-0.5">{d.type}</div>
            </div>
            {d.private && (
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#ff6d00] bg-[#ff6d00]/10 border border-[#ff6d00]/30 rounded-full px-2 py-0.5">Private</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function History({ m }) {
  const g = m.global_history;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Panel title="Countries on Record">
        <div className="flex flex-wrap gap-2">{g.countries.map(c => <Chip key={c}>{c}</Chip>)}</div>
      </Panel>
      <Panel title="Festivals">
        <div className="flex flex-wrap gap-2">{g.festivals.map(c => <Chip key={c}>{c}</Chip>)}</div>
      </Panel>
      <Panel title="Tours">
        <div className="flex flex-wrap gap-2">{g.tours.map(c => <Chip key={c}>{c}</Chip>)}</div>
      </Panel>
      <Panel title="Writing Camps">
        <div className="flex flex-wrap gap-2">{g.writing_camps.map(c => <Chip key={c}>{c}</Chip>)}</div>
      </Panel>
      <Panel title="Residencies">
        <div className="flex flex-wrap gap-2">{g.residencies.map(c => <Chip key={c}>{c}</Chip>)}</div>
      </Panel>
      <Panel title="Conferences & Exchange">
        <div className="flex flex-wrap gap-2">
          {g.conferences.map(c => <Chip key={c}>{c}</Chip>)}
          {g.study_abroad.map(c => <Chip key={c} tint="#00e5ff">{c}</Chip>)}
        </div>
      </Panel>
    </div>
  );
}

function Cal({ m }) {
  return (
    <Panel title="Travel Calendar">
      <div className="divide-y divide-white/5">
        {m.calendar.map((e, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 py-4 items-center">
            <div className="col-span-3 md:col-span-2 font-mono text-[11px] tracking-[0.2em] uppercase text-white/50">{e.date}</div>
            <div className="col-span-9 md:col-span-7">
              <div className="text-white text-sm">{e.event}</div>
              <div className="text-white/50 text-xs mt-0.5">{e.city}</div>
            </div>
            <div className="col-span-12 md:col-span-3 md:text-right">
              <Chip>{e.kind}</Chip>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AI({ m }) {
  return (
    <Panel
      title="AI Travel Assistant"
      right={<span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8a2be2] bg-[#8a2be2]/10 border border-[#8a2be2]/30 rounded-full px-2.5 py-1 inline-flex items-center gap-1"><Sparkles size={11}/>Mocked</span>}
    >
      <div className="space-y-3">
        {m.ai_travel_suggestions.map((s, i) => (
          <div key={i} className="border border-white/5 rounded-2xl p-4 bg-white/[0.02]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white text-sm">{s.title}</div>
                <div className="text-white/55 text-xs leading-relaxed mt-1.5">{s.reason}</div>
              </div>
              <button className="text-xs text-white/80 hover:text-white bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 shrink-0">{s.action}</button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Permissions({ m }) {
  const p = m.permissions;
  const tint = { public: "#00e5ff", team: "#8a2be2", booking_only: "#ff6d00", private: "#ff3b30" };
  const label = { public: "Public", team: "Team", booking_only: "Booking-Only", private: "Private" };
  return (
    <Panel title="Granular Sharing Controls">
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(p).map(([level, fields]) => (
          <div key={level} className="border border-white/5 rounded-2xl p-5" data-testid={`perm-${level}`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: tint[level] }} />
              <div className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: tint[level] }}>{label[level]}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {fields.map(f => (
                <span key={f} className="text-xs text-white/85 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 text-white/50 text-xs">
        The Professional Booking Packet™ inherits these rules — only fields at or below the packet's permission level are shared.
      </div>
    </Panel>
  );
}

function Packet({ packets, onRefresh }) {
  const [level, setLevel] = useState("booking_only");
  const [emerg, setEmerg] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  async function create() {
    setCreating(true);
    try {
      const { data } = await api.post("/mobility/booking-packet", {
        permission_level: level, include_emergency: emerg,
      });
      toast.success("Booking Packet generated");
      await onRefresh();
    } catch (e) {
      toast.error("Failed to generate packet");
    } finally {
      setCreating(false);
    }
  }

  async function copyUrl(token) {
    const url = `${window.location.origin}/packet/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
    toast.success("Link copied");
  }

  async function revoke(token) {
    if (!confirm("Revoke this Booking Packet? The link will stop working immediately.")) return;
    await api.delete(`/mobility/booking-packet/${token}`);
    toast.success("Packet revoked");
    await onRefresh();
  }

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-7" data-testid="packet-generator">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            <Package size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl tracking-tight text-white">Professional Booking Packet™</div>
            <div className="text-white/60 text-sm leading-relaxed mt-2 max-w-2xl">
              One click generates a professional booking profile: ANCRID, bio, headshot, riders, travel preferences, airline/hotel programs,
              team contacts, portfolio, and creative achievements — filtered by the permission level you pick.
            </div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="border border-white/10 rounded-2xl p-4">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Permission Level</div>
            <div className="flex flex-wrap gap-1.5">
              {["public","booking_only","team"].map(l => (
                <button
                  key={l}
                  data-testid={`packet-level-${l}`}
                  onClick={() => setLevel(l)}
                  className={`text-xs font-mono uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border transition-colors ${
                    level === l ? "border-white/40 bg-white/[0.08] text-white" : "border-white/10 text-white/50 hover:text-white"
                  }`}
                >{l.replace("_"," ")}</button>
              ))}
            </div>
          </div>
          <div className="border border-white/10 rounded-2xl p-4">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Include Emergency Contact</div>
            <button
              data-testid="packet-emerg"
              onClick={() => setEmerg(v => !v)}
              className={`text-xs font-mono uppercase tracking-[0.16em] px-3 py-1.5 rounded-full border transition-colors ${
                emerg ? "border-[#00e5ff]/60 text-[#00e5ff] bg-[#00e5ff]/10" : "border-white/10 text-white/50"
              }`}
            >
              {emerg ? "On" : "Off"}
            </button>
          </div>
          <div className="border border-white/10 rounded-2xl p-4 flex items-end">
            <button
              data-testid="packet-generate"
              onClick={create}
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black rounded-2xl px-5 py-3 text-sm font-medium disabled:opacity-60"
            >
              {creating ? "Generating…" : "Generate Packet"}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Panel title={`Issued Packets · ${packets.length}`}>
        {packets.length === 0 ? (
          <div className="text-white/40 text-sm font-mono uppercase tracking-[0.2em] py-6 text-center">
            No packets yet. Generate your first above.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {packets.map(p => {
              const url = `${window.location.origin}/packet/${p.token}`;
              return (
                <div key={p.token} className="grid grid-cols-12 gap-3 py-4 items-center" data-testid={`packet-row-${p.token}`}>
                  <div className="col-span-12 md:col-span-4 min-w-0">
                    <div className="font-mono text-xs text-white truncate">{url}</div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Issued {p.issued_at?.slice(0,10)}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white/60">{p.permission_level}</div>
                  <div className="col-span-6 md:col-span-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">Expires {p.expires_at?.slice(0,10)}</div>
                  <div className="col-span-12 md:col-span-2 flex justify-end gap-1.5">
                    <button onClick={() => copyUrl(p.token)} className="inline-flex items-center gap-1 text-xs bg-white/[0.06] border border-white/10 text-white/80 rounded-full px-2.5 py-1.5 hover:text-white">
                      {copied === p.token ? <Check size={11} className="text-[#00e5ff]"/> : <Copy size={11} />}
                    </button>
                    <Link to={`/packet/${p.token}`} target="_blank" className="inline-flex items-center gap-1 text-xs bg-white/[0.06] border border-white/10 text-white/80 rounded-full px-2.5 py-1.5 hover:text-white">
                      <ExternalLink size={11} />
                    </Link>
                    <button onClick={() => revoke(p.token)} className="inline-flex items-center gap-1 text-xs bg-[#ff3b30]/10 border border-[#ff3b30]/30 text-[#ff3b30] rounded-full px-2.5 py-1.5">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff3b30] bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-full px-2.5 py-1">
      <Lock size={11}/>Private
    </span>
  );
}
