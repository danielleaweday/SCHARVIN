import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Users, Compass, ClipboardCheck, FileText,
  GraduationCap, Languages, Wallet, ShieldAlert, Plane,
} from "lucide-react";
import api from "@/lib/api";
import { GlassCard, Loader, Pill, Ring, Disclaimer } from "@/components/common";
import { fmtDateRange } from "@/lib/format";

const TABS = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "preparation", label: "Preparation", icon: ClipboardCheck },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "culture", label: "Culture", icon: GraduationCap },
  { id: "language", label: "Language", icon: Languages },
  { id: "team", label: "Team", icon: Users },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "emergency", label: "Emergency", icon: ShieldAlert },
];

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t, setT] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => { api.get(`/trips/${id}`).then((r) => setT(r.data)); }, [id]);
  if (!t) return <Loader label="Loading trip" />;
  const total = t.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div data-testid="trip-detail-page">
      <button onClick={() => navigate("/trips")} className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> My Trips</button>

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10">
        <img src={t.cover} alt="" className="h-56 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] to-transparent" />
        <div className="absolute bottom-0 flex w-full flex-col gap-4 p-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Pill tone="amber" className="mb-2">{t.status}</Pill>
            <h1 className="font-display text-4xl font-700 text-white">{t.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-cyan" /> {t.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {fmtDateRange(t.start_date, t.end_date)}</span>
            </div>
            <div className="mt-1 text-sm text-white/50">{t.purpose} · {t.travel_type}</div>
          </div>
          <Ring value={t.readiness} size={80} sub="ready" />
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar" data-testid="trip-tabs">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} data-testid={`trip-tab-${tb.id}`}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-600 transition ${tab === tb.id ? "bg-white/15 text-white" : "border border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>
            <tb.icon className="h-3.5 w-3.5" /> {tb.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} data-testid={`trip-panel-${tab}`}>
        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <GlassCard className="p-6 md:col-span-2">
              <h3 className="mb-3 font-display text-xl font-600 text-white">Trip Overview</h3>
              <p className="text-sm leading-relaxed text-white/70">A {t.purpose.toLowerCase()} bringing you to {t.destination}. You are travelling as {t.travel_type.toLowerCase()}, coordinated through <span className="text-cyan">{t.group}</span>. Use the tabs to prepare documents, study the culture, and rehearse essential language.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[["Group", t.group], ["Purpose", t.purpose], ["Days", `${t.itinerary.length} scheduled`]].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/8 bg-white/4 p-4"><div className="text-[10px] uppercase tracking-widest text-white/40">{k}</div><div className="mt-1 text-sm font-600 text-white">{v}</div></div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="mb-3 font-display text-xl font-600 text-white">Quick Links</h3>
              <div className="space-y-2.5">
                <Link to="/trip-mode" className="glass-hover flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-sm text-white"><Plane className="h-4 w-4 text-cyan" /> Open Trip Mode</Link>
                <Link to="/explore/japan" className="glass-hover flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-sm text-white"><Compass className="h-4 w-4 text-violet" /> Destination guide</Link>
                <Link to="/travel-ready" className="glass-hover flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-sm text-white"><ClipboardCheck className="h-4 w-4 text-amber" /> Travel Ready checklist</Link>
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "itinerary" && (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/10" />
            {t.itinerary.map((it, i) => (
              <GlassCard key={i} className="relative p-5">
                <span className="absolute -left-[22px] top-6 h-3 w-3 rounded-full bg-cyan shadow-[0_0_10px_#06b6d4]" />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono-p text-sm text-cyan">{it.day}</span>
                  <span className="font-mono-p text-xs text-white/45">{it.time}</span>
                  <Pill tone="violet">{it.type}</Pill>
                </div>
                <div className="mt-2 font-600 text-white">{it.title}</div>
                <div className="mt-1 text-sm text-white/60">{it.detail}</div>
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "preparation" && (
          <GlassCard className="p-6">
            <h3 className="mb-2 font-display text-xl font-600 text-white">Preparation status</h3>
            <p className="text-sm text-white/60">You're {t.readiness}% ready. Continue your checklist in Travel Ready.</p>
            <Link to="/travel-ready" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white">Open checklist</Link>
          </GlassCard>
        )}

        {tab === "documents" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[{ label: "Passport", masked: "•••••• 4821", status: "Valid" }, { label: "Invitation Letter", masked: "Host studio", status: "On file" }, { label: "Visa Application", masked: "In progress", status: "Pending" }, { label: "Travel Insurance", masked: "•••• 9932", status: "Pending" }].map((d) => (
              <GlassCard key={d.label} className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-white/6 p-3"><FileText className="h-6 w-6 text-cyan" /></div>
                <div className="flex-1"><div className="font-600 text-white">{d.label}</div><div className="font-mono-p text-xs text-white/45">{d.masked}</div></div>
                <Pill tone={d.status === "Valid" || d.status === "On file" ? "green" : "amber"}>{d.status}</Pill>
              </GlassCard>
            ))}
            <div className="sm:col-span-2"><Disclaimer text="Sensitive document values are masked. Verify official requirements with the appropriate government source before traveling." /></div>
          </div>
        )}

        {tab === "culture" && (
          <GlassCard className="p-6">
            <h3 className="mb-2 font-display text-xl font-600 text-white">Cultural preparation</h3>
            <p className="text-sm text-white/60">Complete the country-readiness course for a respectful, confident collaboration.</p>
            <Link to="/culture-school/creative-collaboration-japan" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white"><GraduationCap className="h-4 w-4" /> Creative Collaboration in Japan</Link>
          </GlassCard>
        )}

        {tab === "language" && (
          <GlassCard className="p-6">
            <h3 className="mb-2 font-display text-xl font-600 text-white">Language preparation</h3>
            <p className="text-sm text-white/60">Rehearse studio and performance vocabulary in the Translator.</p>
            <Link to="/translator?mode=creative" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-magenta px-5 py-2.5 text-sm font-600 text-white"><Languages className="h-4 w-4" /> Open Translator</Link>
          </GlassCard>
        )}

        {tab === "team" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.team.map((m) => (
              <GlassCard key={m.name} className="flex items-center gap-4 p-5">
                <img src={m.avatar} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                <div><div className="font-600 text-white">{m.name}</div><div className="text-xs text-white/50">{m.role}</div></div>
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "expenses" && (
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-600 text-white">Expenses</h3>
              <div className="font-mono-p text-2xl font-600 text-cyan">${total.toLocaleString()}</div>
            </div>
            <div className="space-y-2.5">
              {t.expenses.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 p-4">
                  <div><div className="text-sm font-600 text-white">{e.label}</div><Pill tone="violet" className="mt-1">{e.category}</Pill></div>
                  <div className="font-mono-p text-white/80">${e.amount.toLocaleString()} {e.currency}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {tab === "emergency" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="mb-3 font-display text-xl font-600 text-white">In an emergency</h3>
              <p className="text-sm text-white/60">Open the Safety Center for destination emergency numbers, embassy contacts and help options.</p>
              <Link to="/safety" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber to-magenta px-5 py-2.5 text-sm font-600 text-white"><ShieldAlert className="h-4 w-4" /> Safety Center</Link>
            </GlassCard>
            <div className="sm:col-span-1"><Disclaimer text="Demonstration only — this build does not contact real emergency services." /></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
