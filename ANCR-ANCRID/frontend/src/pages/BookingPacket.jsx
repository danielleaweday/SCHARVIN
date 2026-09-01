import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Plane, Hotel, Car, Utensils, Users, PhoneCall, ArrowRight, Globe2, Link2, Package, ScrollText, Wrench } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function BookingPacket() {
  const { pathname } = useLocation();
  const token = pathname.startsWith("/packet/") ? pathname.slice(8) : "";
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;
    axios.get(`${BACKEND}/api/public/packet/${token}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e?.response?.data?.detail || "Packet not found"));
  }, [token]);

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-4xl text-white tracking-tighter">Packet unavailable</div>
          <div className="text-white/40 text-sm mt-3 font-mono uppercase tracking-[0.2em]">{err}</div>
          <Link to="/" className="inline-flex items-center gap-2 mt-8 text-sm bg-white text-black px-5 py-3 rounded-full">
            Back to ANCRID <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen" />;

  const c = data.creator;
  const m = data.mobility || {};

  return (
    <div className="min-h-screen" data-testid="packet-page">
      {/* Ribbon */}
      <div className="w-full bg-gradient-to-r from-[#00e5ff]/10 via-[#8a2be2]/10 to-[#ff6d00]/10 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-2.5 flex items-center justify-between text-[10px] font-mono tracking-[0.3em] uppercase text-white/50 flex-wrap gap-2">
          <span className="inline-flex items-center gap-2">
            <Package size={11} className="text-[#00e5ff]" /> Professional Booking Packet™ · Issued by ANCRID
          </span>
          <span>Permission · {data.permission_level?.replace("_"," ")} · Expires {data.expires_at?.slice(0,10)}</span>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <div className="font-display text-xl tracking-tighter text-white leading-none">ANCRID<span className="text-white/40 text-xs align-super">™</span></div>
            <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/40 mt-0.5">Part of the ANCR Ecosystem</div>
          </div>
        </Link>
        <Link to={`/@${c.handle}`} className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5">
          View verified identity <ArrowRight size={13} />
        </Link>
      </header>

      {/* Creator card */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-4 pb-10">
        <div className="rounded-3xl overflow-hidden ancr-gradient-border" data-testid="packet-hero">
          <div className="bg-[#070707] rounded-3xl relative">
            {c.banner_url && (
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img src={c.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] to-transparent" />
              </div>
            )}
            <div className="px-8 md:px-12 pb-8 -mt-16 relative flex items-end gap-6 flex-wrap">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-white/20 bg-black shrink-0">
                {c.headshot_url && <img src={c.headshot_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/50">Bearer · Booking Packet™</div>
                <div className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-2">{c.name}</div>
                <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/60 mt-2">@{c.handle} · {c.role}</div>
                <div className="text-white/60 text-sm mt-1">{c.institution} · {c.location}</div>
              </div>
              {c.verification_status === "Verified" && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full px-3 py-1.5">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>

            <div className="px-8 md:px-12 pb-8 grid md:grid-cols-4 gap-6 border-t border-white/5 pt-6">
              <Cell k="ANCRID №" v={c.ancrid_number} mono />
              <Cell k="Passport" v={c.creator_passport_id} mono />
              <Cell k="Website" v={c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="hover:text-white">{c.website}</a> : "—"} />
              <Cell k="Location" v={c.location} />
            </div>
          </div>
        </div>
      </section>

      {/* Biography + Portfolio */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass rounded-3xl p-7">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Biography</div>
          <div className="mt-3 text-white/85 text-base leading-relaxed">{c.biography}</div>
          {c.mission && (
            <>
              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mt-6">Mission</div>
              <div className="mt-2 text-white/75 text-sm leading-relaxed">{c.mission}</div>
            </>
          )}
        </div>
        <div className="lg:col-span-2 glass rounded-3xl p-7">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-3">Portfolio Highlights</div>
          <div className="space-y-3">
            {(data.portfolio || []).slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3 border border-white/5 rounded-2xl p-3">
                <img src={p.cover} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="text-white text-sm truncate">{p.title}</div>
                  <div className="text-white/50 text-xs mt-0.5">{p.medium} · {p.role} · {p.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Preferences */}
      {m.preferences && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10">
          <BookingSection title="Travel Preferences" icon={Plane}>
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-5">
              <Cell k="Seat" v={m.preferences.seat} />
              <Cell k="Cabin" v={m.preferences.cabin} />
              <Cell k="Home Airport" v={m.preferences.home_airport} mono />
              <Cell k="Airlines" v={(m.preferences.airlines||[]).join(" · ")} />
              <Cell k="Hotel Brands" v={(m.preferences.hotel_brands||[]).join(" · ")} />
              <Cell k="Rental" v={m.preferences.rental} />
              <Cell k="Ground Transport" v={(m.preferences.ground_transport||[]).join(" · ")} />
            </div>
          </BookingSection>
        </section>
      )}

      {/* Airline / Hotel / Rental programs */}
      {(m.airlines || m.hotels || m.rentals) && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10 grid md:grid-cols-3 gap-4">
          {m.airlines && <ProgramBlock title="Airlines" icon={Plane} rows={m.airlines.map(a => [a.airline, a.status])} />}
          {m.hotels   && <ProgramBlock title="Hotels"   icon={Hotel} rows={m.hotels.map(h => [h.program, h.status])} />}
          {m.rentals  && <ProgramBlock title="Rental"   icon={Car}   rows={m.rentals.map(r => [r.company, r.status])} />}
        </section>
      )}

      {/* Dietary */}
      {m.dietary && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10">
          <BookingSection title="Dietary" icon={Utensils}>
            <div className="flex flex-wrap gap-2">
              {(m.dietary.restrictions || []).map(r => (
                <span key={r} className="text-xs bg-[#ff6d00]/10 border border-[#ff6d00]/30 text-[#ff6d00] rounded-full px-3 py-1.5">{r}</span>
              ))}
            </div>
          </BookingSection>
        </section>
      )}

      {/* Riders */}
      {m.riders && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10 grid md:grid-cols-2 gap-4">
          <BookingSection title="Hospitality Rider" icon={Wrench}>
            <div className="text-white/80 text-sm leading-relaxed">{m.riders.hospitality}</div>
          </BookingSection>
          <BookingSection title="Technical Rider" icon={ScrollText}>
            <div className="text-white/80 text-sm leading-relaxed">{m.riders.technical}</div>
          </BookingSection>
        </section>
      )}

      {/* Team */}
      {m.team && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10">
          <BookingSection title="Booking & Team" icon={Users}>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(m.team).filter(([k]) => !["band","crew"].includes(k)).map(([role, c]) => (
                <div key={role} className="grid grid-cols-3 gap-3 border-b border-white/5 pb-2">
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40 pt-1">{role.replace(/_/g, " ")}</div>
                  <div className="text-white text-sm">{c.name}</div>
                  <div className="font-mono text-xs text-white/70 text-right">{c.phone || c.email || "—"}</div>
                </div>
              ))}
            </div>
          </BookingSection>
        </section>
      )}

      {/* Emergency (if included) */}
      {m.emergency && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-10">
          <BookingSection title="Emergency Contact" icon={PhoneCall}>
            <div className="grid md:grid-cols-2 gap-3">
              {m.emergency.map((e, i) => (
                <div key={i} className="border border-white/5 rounded-2xl px-4 py-3">
                  <div className="text-white text-sm">{e.name}</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">{e.relation}</div>
                  <div className="font-mono text-xs text-white/70 mt-2">{e.phone} · {e.email}</div>
                </div>
              ))}
            </div>
          </BookingSection>
        </section>
      )}

      {/* Booking Contact */}
      {data.mobility?.booking && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16">
          <div className="glass-strong rounded-3xl p-7 md:p-9 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Direct Booking</div>
              <div className="font-display text-3xl md:text-4xl tracking-tighter text-white mt-2">Book through the agent of record.</div>
              <div className="text-white/60 text-sm mt-3 max-w-md">This packet is machine-verifiable and issued by ANCRID Trust on behalf of {c.name}.</div>
            </div>
            <div className="space-y-3">
              <div className="border border-white/10 rounded-2xl p-4">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">Booking Agent</div>
                <div className="text-white text-base mt-1">{data.mobility.booking.agent?.name}</div>
                <div className="font-mono text-sm text-white/70 mt-1">
                  {data.mobility.booking.agent?.email} · {data.mobility.booking.agent?.phone}
                </div>
              </div>
              <div className="border border-white/10 rounded-2xl p-4">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">Management</div>
                <div className="text-white text-base mt-1">{data.mobility.booking.management}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 border-t border-white/5 grid md:grid-cols-3 items-center gap-6">
        <div className="font-mono tracking-[0.24em] uppercase text-white/40 text-xs">© 2026 ANCR · ANCRID™</div>
        <div className="flex items-center justify-center">
          <img
            src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/0j1q4by9_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png"
            alt="ANCR" className="h-9 opacity-80" />
        </div>
        <div className="font-mono tracking-[0.2em] uppercase text-white/40 text-xs md:text-right">Part of the ANCR Ecosystem</div>
      </footer>
    </div>
  );
}

function Cell({ k, v, mono }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/40">{k}</div>
      <div className={`text-white text-sm mt-1 ${mono ? "font-mono" : ""}`}>{v || "—"}</div>
    </div>
  );
}

function BookingSection({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-3xl p-7">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={14} className="text-white/60" />
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/60">{title}</div>
      </div>
      {children}
    </div>
  );
}

function ProgramBlock({ title, icon: Icon, rows }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-white/60" />
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/60">{title}</div>
      </div>
      <div className="space-y-2">
        {rows.map(([name, status], i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="text-white text-sm">{name}</div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e5ff]">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
