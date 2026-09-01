import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, MapPin, Languages, Coins, Bus, Sparkles, Phone, Building2,
  FileText, ShieldCheck, LifeBuoy, Volume2, X, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader, Pill, Disclaimer } from "@/components/common";

const speak = (t) => { try { const u = new SpeechSynthesisUtterance(t); u.lang = "ja-JP"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch {} };

export default function TripMode() {
  const [d, setD] = useState(null);
  const [now, setNow] = useState(new Date());
  const [help, setHelp] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [amount, setAmount] = useState(100);

  useEffect(() => { api.get("/trip-mode").then((r) => setD(r.data)); }, []);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  if (!d) return <Loader label="Entering Trip Mode" />;

  const localTime = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(now);
  const homeTime = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(now);
  const next = d.itinerary[0];

  return (
    <div className="mx-auto max-w-md" data-testid="trip-mode-page">
      {/* Header */}
      <div className="mb-5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B1021] to-[#131B2F] p-6">
        <Pill tone="cyan" className="mb-3"><Sparkles className="h-3 w-3" /> Trip Mode</Pill>
        <div className="flex items-center gap-2 font-display text-2xl font-700 text-white"><MapPin className="h-6 w-6 text-cyan" /> {d.destination}</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Local · {d.timezone}</div>
            <div className="font-mono-p text-2xl font-600 text-white">{localTime}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Home</div>
            <div className="font-mono-p text-2xl font-600 text-white/70">{homeTime}</div>
          </div>
        </div>
      </div>

      {/* Next event */}
      <div className="mb-4 rounded-2xl border border-cyan/25 bg-cyan/8 p-5" data-testid="next-event">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan/80"><Clock className="h-3.5 w-3.5" /> Next event</div>
        <div className="mt-1 font-display text-xl font-600 text-white">{next.title}</div>
        <div className="mt-1 text-sm text-white/60">{next.day} · {next.time} — {next.detail}</div>
      </div>

      {/* Today itinerary */}
      <SectionCard title="Today's Itinerary" testid="tm-itinerary">
        <div className="space-y-2">
          {d.itinerary.slice(0, 4).map((it, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
              <span className="font-mono-p text-xs text-cyan">{it.time}</span>
              <span className="text-sm text-white/80">{it.title}</span>
              <Pill tone="muted" className="ml-auto">{it.type}</Pill>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Essential phrases */}
      <SectionCard title="Essential Phrases" testid="tm-phrases">
        <div className="space-y-2">
          {d.essential_phrases.map((p, i) => (
            <button key={i} onClick={() => speak(p.text)} data-testid={`tm-phrase-${i}`} className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-left transition hover:border-cyan/40">
              <Volume2 className="h-4 w-4 text-cyan" />
              <div className="flex-1"><div className="text-sm font-600 text-white">{p.text}</div><div className="text-xs text-white/45">{p.meaning}</div></div>
            </button>
          ))}
        </div>
        <Link to="/translator" data-testid="tm-open-translator" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet py-3 text-sm font-600 text-white"><Languages className="h-4 w-4" /> Start live translator</Link>
      </SectionCard>

      {/* Currency + transport */}
      <div className="mb-4 grid grid-cols-1 gap-4">
        <SectionCard title="Currency Converter" testid="tm-currency">
          <div className="flex items-center gap-3">
            <div className="flex-1"><div className="text-[10px] uppercase text-white/40">USD</div>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} data-testid="currency-input" className="w-full rounded-xl border border-white/10 bg-black/30 p-2 font-mono-p text-white outline-none" />
            </div>
            <ChevronRight className="mt-4 h-4 w-4 text-white/40" />
            <div className="flex-1"><div className="text-[10px] uppercase text-white/40">JPY (≈149)</div>
              <div className="rounded-xl border border-cyan/25 bg-cyan/8 p-2 font-mono-p text-cyan">¥{(amount * 149).toLocaleString()}</div>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-white/35">Indicative demonstration rate.</p>
        </SectionCard>
        <SectionCard title="Getting Around" testid="tm-transport"><div className="flex items-start gap-2 text-sm text-white/70"><Bus className="mt-0.5 h-4 w-4 text-violet" /> Tap your IC card (Suica/Pasmo) at any gate. Trains run to the minute — arrive 5 minutes early.</div></SectionCard>
        <div className="rounded-2xl border border-violet/25 bg-violet/8 p-5" data-testid="tm-cultural-reminder"><div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-violet"><Sparkles className="h-3.5 w-3.5" /> Cultural reminder</div><p className="mt-1 text-sm text-white/75">{d.cultural_reminder}</p></div>
      </div>

      {/* Emergency + embassy + docs */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber/25 bg-amber/8 p-4" data-testid="tm-emergency"><Phone className="h-5 w-5 text-amber" /><div className="mt-2 text-[10px] uppercase text-white/40">Emergency</div>{d.emergency_numbers.map((e) => <div key={e.label} className="font-mono-p text-lg text-amber">{e.number} <span className="text-[10px] text-white/40">{e.label}</span></div>)}</div>
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4" data-testid="tm-embassy"><Building2 className="h-5 w-5 text-cyan" /><div className="mt-2 text-[10px] uppercase text-white/40">Embassy</div><p className="mt-1 text-xs text-white/65">{d.embassy}</p></div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button onClick={() => toast.success("Checked in safely — trusted contacts notified (demo)")} data-testid="tm-checkin" className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-4 text-sm font-600 text-emerald-300"><ShieldCheck className="h-5 w-5" /> Check in safely</button>
        <button onClick={() => toast("Offline documents available in this demo")} data-testid="tm-offline-docs" className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 py-4 text-sm font-600 text-white"><FileText className="h-5 w-5" /> Offline documents</button>
      </div>

      {/* I need help */}
      <button onClick={() => setHelp(true)} data-testid="i-need-help-btn" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber via-magenta to-magenta py-5 text-base font-700 text-white shadow-[0_0_40px_-8px_rgba(217,70,239,0.6)] transition hover:brightness-110">
        <LifeBuoy className="h-6 w-6" /> I Need Help
      </button>

      <Disclaimer className="mt-4" text={d.disclaimer} />

      {/* Help sheet */}
      {help && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={() => { setHelp(false); setSelectedHelp(null); }}>
          <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0B1021] p-6 sm:rounded-3xl" data-testid="help-sheet">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-600 text-white">How can we help?</h3>
              <button onClick={() => { setHelp(false); setSelectedHelp(null); }} className="text-white/50"><X className="h-5 w-5" /></button>
            </div>
            {!selectedHelp ? (
              <div className="space-y-2">
                {d.help_options.map((o) => (
                  <button key={o.id} onClick={() => setSelectedHelp(o)} data-testid={`help-option-${o.id}`} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/4 p-4 text-left text-sm font-500 text-white transition hover:border-magenta/40">
                    {o.label} <ChevronRight className="h-4 w-4 text-white/40" />
                  </button>
                ))}
              </div>
            ) : (
              <div data-testid="help-detail">
                <Pill tone="magenta" className="mb-3">{selectedHelp.label}</Pill>
                <p className="text-sm leading-relaxed text-white/75">{selectedHelp.guidance}</p>
                <button onClick={() => setSelectedHelp(null)} className="mt-4 text-sm text-cyan">← Back to options</button>
              </div>
            )}
            <Disclaimer className="mt-4" text="Demonstration only — these buttons do NOT contact real emergency services." />
          </motion.div>
        </div>
      )}
    </div>
  );
}

const SectionCard = ({ title, children, testid }) => (
  <div className="mb-4 rounded-2xl border border-white/10 bg-white/4 p-5" data-testid={testid}>
    <h3 className="mb-3 font-display text-lg font-600 text-white">{title}</h3>
    {children}
  </div>
);
