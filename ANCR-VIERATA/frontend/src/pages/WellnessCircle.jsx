import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Users, Calendar, MapPin, Loader2, UserCheck, MessageCircle, ArrowRight } from "lucide-react";

function fmtWhen(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function WellnessCircle() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = () => api.get("/circles").then(({ data }) => setItems(data.items));
  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    setBusy(c.id);
    try {
      const { data } = await api.post("/circles/rsvp", { circle_id: c.id });
      toast.success(data.rsvp ? `RSVP confirmed — ${c.title}` : "RSVP removed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't update RSVP");
    } finally { setBusy(null); }
  };

  return (
    <div className="fade-up" data-testid="circles-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#D97706" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Users className="w-3.5 h-3.5" /> Wellness Circle
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Small groups. <span className="viearta-gradient">Real conversations.</span>
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">RSVP to a Wellness Circle and see who else from your discipline is joining. Names are shown only after mutual RSVP within a circle.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="circles-list">
        {items.map((c) => (
          <div key={c.id} data-testid={`circle-${c.id}`} className="glass rounded-3xl p-6 relative overflow-hidden">
            <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{c.focus}</div>
            <h3 className="font-display text-2xl mt-1">{c.title}</h3>
            <p className="text-white/60 text-sm mt-1">{c.description}</p>

            <div className="mt-3 text-xs text-white/60 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtWhen(c.starts_at)}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location}</span>
              <span>· {c.duration_minutes} min</span>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <div className="text-xs text-white/60">{c.rsvp_count} / {c.capacity} joined · {c.spots_left} spots left</div>
              {c.my_rsvp && <span className="inline-flex items-center gap-1 text-xs text-viearta-teal border border-viearta-teal/30 bg-viearta-teal/10 rounded-full px-2 py-0.5"><UserCheck className="w-3 h-3" /> You're in</span>}
            </div>

            {Object.keys(c.by_discipline).length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Who's joining</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(c.by_discipline).map(([d, n]) => (
                    <span key={d} className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-white/70">{d} · {n}</span>
                  ))}
                </div>
                {c.my_rsvp && c.attendees.length > 0 && (
                  <div className="mt-2 text-[11px] text-white/55">
                    {c.attendees.slice(0, 8).map((a, i) => (
                      <span key={i}>{a.first_name}{i < Math.min(c.attendees.length, 8) - 1 ? " · " : ""}</span>
                    ))}
                    {c.attendees.length > 8 && <span> · +{c.attendees.length - 8} more</span>}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => navigate(`/circle/${c.id}`)} data-testid={`circle-open-${c.id}`}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm border border-white/15 hover:border-white/30">
                <MessageCircle className="w-4 h-4" /> Chat & videos <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => toggle(c)} disabled={busy === c.id || (!c.my_rsvp && c.spots_left === 0)}
                data-testid={`circle-rsvp-${c.id}`}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm ${c.my_rsvp ? "bg-white/10 border border-white/20 hover:bg-white/15" : "bg-white text-black hover:bg-white/90"} disabled:opacity-60`}>
                {busy === c.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {c.my_rsvp ? "Cancel RSVP" : c.spots_left === 0 ? "Full" : "RSVP"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
