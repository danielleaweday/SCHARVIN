import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Layers, GitCompareArrows, Languages, Music2, Drum, Guitar,
  ClipboardList, BrainCircuit, GraduationCap, Route, ShieldCheck, Loader2,
  Volume2, Play, Square, ArrowLeftRight, X, ChevronRight, Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Disclaimer, fadeUp, staggerContainer } from "@/components/common";
import { playScale, playPhrase, playRhythm, NOTE_C4 } from "@/lib/audio";

const LANGS = ["English", "Hindi", "Arabic", "Japanese", "Korean", "Portuguese", "Spanish", "French", "Yoruba", "Twi"];
const TONICS = [{ n: "C", hz: 261.63 }, { n: "D", hz: 293.66 }, { n: "E", hz: 329.63 }, { n: "G", hz: 392.0 }, { n: "A", hz: 440.0 }];

const TABS = [
  { id: "atlas", label: "Systems Atlas", icon: Layers },
  { id: "compare", label: "Comparison", icon: GitCompareArrows },
  { id: "session", label: "Session Translator", icon: Languages },
  { id: "reference", label: "Scale / Raga / Maqam", icon: Music2 },
  { id: "rhythm", label: "Rhythm & Time Lab", icon: Drum },
  { id: "instruments", label: "Instruments", icon: Guitar },
  { id: "rehearsal", label: "Global Rehearsal Mode", icon: ClipboardList },
  { id: "knowledge", label: "Knowledge Translator", icon: BrainCircuit },
  { id: "classroom", label: "Music Classroom", icon: GraduationCap },
  { id: "pathways", label: "Demo Pathways", icon: Route },
];

export default function MusicCompass() {
  const [tab, setTab] = useState("atlas");
  const [overview, setOverview] = useState(null);
  const [traditions, setTraditions] = useState([]);

  useEffect(() => {
    api.get("/music/overview").then((r) => setOverview(r.data)).catch(() => {});
    api.get("/music/traditions").then((r) => setTraditions(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="music-compass-page">
      <PageHeader eyebrow="Global Music Compass"
        title={<span>How the world <span className="grad-text">hears &amp; creates</span></span>}
        subtitle="Understand how the world hears, creates, rehearses, and communicates music — and collaborate respectfully across traditions."
        testid="music-compass-header" />

      {overview && <Disclaimer className="mb-6" text={overview.stewardship_notice} />}

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar" data-testid="music-tabs">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`music-tab-${t.id}`}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-600 transition ${tab === t.id ? "bg-gradient-to-r from-cyan to-violet text-white" : "border border-white/12 bg-white/5 text-white/55 hover:text-white"}`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          {tab === "atlas" && <Atlas traditions={traditions} />}
          {tab === "compare" && <Compare traditions={traditions} />}
          {tab === "session" && <SessionTranslator traditions={traditions} />}
          {tab === "reference" && <Reference audioNotice={overview?.audio_notice} />}
          {tab === "rhythm" && <RhythmLab />}
          {tab === "instruments" && <Instruments />}
          {tab === "rehearsal" && <Rehearsal traditions={traditions} />}
          {tab === "knowledge" && <Knowledge traditions={traditions} />}
          {tab === "classroom" && <Classroom />}
          {tab === "pathways" && <Pathways />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const permTone = (p) => ({ public: "green", educational: "cyan", restricted: "amber", "community-controlled": "magenta" }[p] || "muted");

function Atlas({ traditions }) {
  const [detail, setDetail] = useState(null);
  const open = async (id) => { const { data } = await api.get(`/music/traditions/${id}`); setDetail(data); };
  return (
    <div>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {traditions.map((t) => (
          <motion.div key={t.id} variants={fadeUp}>
            <button onClick={() => open(t.id)} data-testid={`tradition-${t.id}`} className="w-full text-left">
              <GlassCard hover className="group h-full overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img src={t.hero} alt={t.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />
                  <Pill tone={permTone(t.permission_level)} className="absolute right-3 top-3 capitalize">{t.permission_level}</Pill>
                  <div className="absolute bottom-3 left-4 font-display text-xl font-600 text-white">{t.short}</div>
                </div>
                <div className="p-5">
                  <div className="text-sm font-600 text-white">{t.name}</div>
                  <div className="mt-1 text-xs text-white/45">{t.region}</div>
                  <p className="mt-2 line-clamp-3 text-sm text-white/60">{t.context}</p>
                </div>
              </GlassCard>
            </button>
          </motion.div>
        ))}
      </motion.div>
      {detail && <TraditionModal t={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

const Field = ({ label, children }) => (
  <div className="rounded-xl border border-white/8 bg-white/4 p-4">
    <div className="text-[10px] uppercase tracking-widest text-cyan/70">{label}</div>
    <div className="mt-1 text-sm text-white/75">{children}</div>
  </div>
);

function TraditionModal({ t, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
        className="mx-auto my-6 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B1021]" data-testid="tradition-modal">
        <div className="relative h-52">
          <img src={t.hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white"><X className="h-5 w-5" /></button>
          <div className="absolute bottom-4 left-6">
            <Pill tone={permTone(t.gov.permission_level)} className="mb-2 capitalize">{t.gov.permission_level} access</Pill>
            <h2 className="font-display text-3xl font-700 text-white">{t.name}</h2>
            <div className="text-sm text-white/60">{t.region} · {t.community}</div>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <p className="mb-4 text-white/75">{t.context}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Pitch organization">{t.pitch_organization}</Field>
            <Field label="Tuning">{t.tuning}</Field>
            <Field label="Tonal center">{t.tonal_center}</Field>
            <Field label="Systems">{t.systems}</Field>
            <Field label="Movement">{t.movement}</Field>
            <Field label="Microtonal / flexible pitch">{t.microtonal}</Field>
            <Field label="Ornamentation">{t.ornamentation}</Field>
            <Field label="Improvisation">{t.improvisation}</Field>
            <Field label="Rhythm & time">{t.rhythm}</Field>
            <Field label="Form">{t.form}</Field>
            <Field label="Ensemble roles & cueing">{t.ensemble_roles}</Field>
            <Field label="Notation / transmission">{t.notation}</Field>
            <Field label="Vocal practices">{t.vocal}</Field>
            <Field label="Rehearsal etiquette">{t.rehearsal_etiquette}</Field>
            <Field label="Performance context">{t.performance_context}</Field>
            <Field label="Spiritual / social meaning">{t.meaning}</Field>
            <Field label="Cultural permissions">{t.permissions}</Field>
            <Field label="Common instruments">{t.instruments.join(", ")}</Field>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="text-[10px] uppercase tracking-widest text-violet">Recommended listening</div>
              <ul className="mt-2 space-y-1 text-sm text-white/70">{t.listening.map((l, i) => <li key={i}>• {l}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="text-[10px] uppercase tracking-widest text-violet">Glossary</div>
              <ul className="mt-2 space-y-1 text-sm text-white/70">{t.glossary.map((g, i) => <li key={i}><span className="text-white">{g.term}</span> — {g.meaning}</li>)}</ul>
            </div>
          </div>
          {/* Governance */}
          <div className="mt-4 rounded-xl border border-amber/25 bg-amber/5 p-4" data-testid="governance">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber"><ShieldCheck className="h-3.5 w-3.5" /> Cultural stewardship & accuracy</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60 sm:grid-cols-3">
              <div>Practitioner: {t.gov.practitioner_reviewer}</div>
              <div>Scholar: {t.gov.scholar_reviewer}</div>
              <div>Permission: {t.gov.permission_level}</div>
              <div>Sensitivity: {t.gov.cultural_sensitivity}</div>
              <div>Audio rights: {t.gov.audio_rights}</div>
              <div>Verified: {t.gov.last_verified}</div>
            </div>
          </div>
          <Disclaimer className="mt-4" text={t.stewardship_notice} />
        </div>
      </motion.div>
    </div>
  );
}

function Compare({ traditions }) {
  const [a, setA] = useState("american-jazz");
  const [b, setB] = useState("hindustani");
  const [presets, setPresets] = useState([]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { api.get("/music/comparisons").then((r) => setPresets(r.data)).catch(() => {}); }, []);

  const run = async () => {
    if (a === b) { toast.error("Pick two different traditions"); return; }
    setLoading(true); setRes(null);
    try { const { data } = await api.post("/music/compare", { a, b }); setRes(data); }
    catch { toast.error("Comparison failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.id} onClick={() => { setA(p.a); setB(p.b); }} data-testid={`compare-preset-${p.id}`} className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-cyan/40">{p.title}</button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={a} onChange={(e) => setA(e.target.value)} data-testid="compare-a" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.short}</option>)}</select>
          <ArrowLeftRight className="h-4 w-4 text-cyan" />
          <select value={b} onChange={(e) => setB(e.target.value)} data-testid="compare-b" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.short}</option>)}</select>
          <button onClick={run} disabled={loading} data-testid="compare-run" className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-600 text-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompareArrows className="h-4 w-4" />} Compare</button>
        </div>
        <p className="mt-3 text-xs text-white/40">A raga, maqam, or makam is never "the same as" a Western scale. Western references are only an orientation tool.</p>
      </GlassCard>

      {res && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="compare-result">
          <ListCard title="Familiar concepts" items={res.familiar_concepts} tone="green" />
          <div className="rounded-2xl border border-amber/25 bg-amber/5 p-5">
            <h4 className="mb-2 font-600 text-amber">Similar-looking but different</h4>
            <ul className="space-y-2 text-sm">{(res.similar_but_different || []).map((x, i) => <li key={i}><span className="text-white">{x.concept}</span> — <span className="text-white/60">{x.note}</span></li>)}</ul>
          </div>
          <ListCard title="New vocabulary" items={res.new_vocabulary} tone="violet" />
          <ListCard title="Common mistakes to avoid" items={res.common_mistakes} tone="magenta" />
          <TextCard title="Pitch & tuning" text={res.pitch_tuning} />
          <TextCard title="Rhythm & time" text={res.rhythm_time} />
          <TextCard title="Improvisation" text={res.improvisation} />
          <TextCard title="Rehearsal communication" text={res.rehearsal_communication} />
          <TextCard title="Ensemble hierarchy" text={res.ensemble_hierarchy} />
          <ListCard title="Listening recommendations" items={res.listening} tone="cyan" />
          <div className="md:col-span-2"><ListCard title="Questions to ask the local musician / MD" items={res.questions_to_ask} tone="cyan" /></div>
          <div className="md:col-span-2"><Disclaimer text={res.stewardship_notice} /></div>
        </motion.div>
      )}
    </div>
  );
}

const ListCard = ({ title, items, tone = "cyan" }) => (
  <GlassCard className="p-5">
    <h4 className="mb-2 font-600 text-white">{title}</h4>
    <ul className="space-y-1.5 text-sm text-white/70">{(items || []).map((x, i) => <li key={i} className="flex gap-2"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${tone}`} />{x}</li>)}</ul>
  </GlassCard>
);
const TextCard = ({ title, text }) => (
  <GlassCard className="p-5"><h4 className="mb-2 font-600 text-white">{title}</h4><p className="text-sm text-white/70">{text}</p></GlassCard>
);

function SessionTranslator({ traditions }) {
  const [phrases, setPhrases] = useState([]);
  const [source, setSource] = useState("English");
  const [target, setTarget] = useState("Hindi");
  const [tradition, setTradition] = useState("hindustani");
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { api.get("/music/session-phrases").then((r) => setPhrases(r.data)).catch(() => {}); }, []);

  const run = async (t) => {
    const phrase = t || text;
    if (!phrase.trim()) { toast.error("Enter or pick a phrase"); return; }
    setText(phrase); setLoading(true); setRes(null);
    try { const { data } = await api.post("/music/session-translate", { text: phrase, source_lang: source, target_lang: target, tradition }); setRes(data); }
    catch { toast.error("Translation failed"); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="translator-frame p-6">
        <div className="flex flex-wrap items-center gap-2">
          <select value={source} onChange={(e) => setSource(e.target.value)} data-testid="session-source" className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white outline-none">{LANGS.map((l) => <option key={l} className="bg-[#0B1021]">{l}</option>)}</select>
          <ArrowLeftRight className="h-4 w-4 text-cyan" />
          <select value={target} onChange={(e) => setTarget(e.target.value)} data-testid="session-target" className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white outline-none">{LANGS.map((l) => <option key={l} className="bg-[#0B1021]">{l}</option>)}</select>
          <select value={tradition} onChange={(e) => setTradition(e.target.value)} data-testid="session-tradition" className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.short}</option>)}</select>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Enter a rehearsal / studio phrase…" data-testid="session-input" className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan/40" />
        <button onClick={() => run()} disabled={loading} data-testid="session-translate-btn" className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-600 text-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />} Translate</button>
        <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto no-scrollbar">
          {phrases.map((p, i) => (
            <button key={i} onClick={() => run(p.text)} data-testid={`session-phrase-${i}`} className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-white/4 p-2.5 text-left text-xs text-white/80 transition hover:border-cyan/40"><Pill tone="violet">{p.category}</Pill> {p.text}</button>
          ))}
        </div>
      </div>

      <GlassCard className="p-6">
        {loading && <div className="flex items-center gap-2 text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Translating…</div>}
        {!loading && !res && <p className="text-sm text-white/45">Translation, transliteration, musical meaning and cultural context appear here.</p>}
        {res && (
          <div className="space-y-3" data-testid="session-result">
            <div className="rounded-xl border border-cyan/25 bg-cyan/5 p-4">
              <div className="font-display text-2xl font-600 text-white">{res.translated}</div>
              {res.transliteration && <div className="font-mono-p text-sm text-white/60">{res.transliteration}</div>}
              <div className="font-mono-p text-xs text-white/45">{res.pronunciation}</div>
            </div>
            <Field label="Musical meaning">{res.music_meaning}</Field>
            <Field label="Cultural context">{res.cultural_context}</Field>
            <div className="rounded-xl border border-amber/25 bg-amber/5 p-4"><div className="text-[10px] uppercase tracking-widest text-amber">Potential misunderstanding</div><div className="mt-1 text-sm text-white/75">{res.potential_misunderstanding}</div></div>
            {res.respectful_alternative && <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"><div className="text-[10px] uppercase tracking-widest text-emerald-400">More respectful alternative</div><div className="mt-1 text-sm text-white/75">{res.respectful_alternative}</div></div>}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Reference({ audioNotice }) {
  const [traditions, setTraditions] = useState([]);
  const [tid, setTid] = useState("hindustani");
  const [detail, setDetail] = useState(null);
  const [sel, setSel] = useState(0);
  const [tonic, setTonic] = useState(NOTE_C4);
  const [showStaff, setShowStaff] = useState(false);
  useEffect(() => { api.get("/music/traditions").then((r) => { const withScales = r.data; setTraditions(withScales); }); }, []);
  useEffect(() => { api.get(`/music/traditions/${tid}`).then((r) => { setDetail(r.data); setSel(0); }); }, [tid]);

  const scale = detail?.scales?.[sel];
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <select value={tid} onChange={(e) => setTid(e.target.value)} data-testid="ref-tradition" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.short}</option>)}</select>
          {detail?.scales?.length > 0 && (
            <select value={sel} onChange={(e) => setSel(Number(e.target.value))} data-testid="ref-system" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">{detail.scales.map((s, i) => <option key={i} value={i} className="bg-[#0B1021]">{s.name}</option>)}</select>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/50">Tonic:
            {TONICS.map((t) => <button key={t.n} onClick={() => setTonic(t.hz)} data-testid={`ref-tonic-${t.n}`} className={`rounded-full px-2.5 py-1 ${Math.abs(tonic - t.hz) < 1 ? "bg-cyan/20 text-cyan" : "bg-white/5 text-white/60"}`}>{t.n}</button>)}
          </div>
        </div>
      </GlassCard>

      {!scale ? (
        <GlassCard className="p-8 text-center text-white/50" data-testid="ref-none">This tradition is documented as rhythm/ensemble-focused, or its pitch reference is pending practitioner review.</GlassCard>
      ) : (
        <GlassCard className="p-6" data-testid="ref-detail">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-display text-2xl font-600 text-white">{scale.name}</h3><Pill tone="violet" className="mt-1 capitalize">{scale.type}</Pill></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => playScale(scale.ascending, tonic)} data-testid="ref-ascending" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cyan"><Play className="h-4 w-4" /> Ascending</button>
              <button onClick={() => playScale(scale.descending, tonic)} data-testid="ref-descending" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cyan"><Play className="h-4 w-4" /> Descending</button>
              <button onClick={() => playPhrase(scale.ascending.concat([...scale.descending].slice(1)), tonic)} data-testid="ref-phrase" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-violet"><Volume2 className="h-4 w-4" /> Phrase</button>
            </div>
          </div>

          {/* Pitch map */}
          <div className="mt-5 flex flex-wrap gap-1.5" data-testid="pitch-map">
            {scale.ascending.map((s, i) => (
              <button key={i} onClick={() => playScale([s], tonic)} className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-cyan/50">
                <span className="font-mono-p text-sm text-white">{scale.degrees?.[i] || s}</span>
                <span className="text-[9px] text-white/35">{String(s).includes(".") ? "¼" : ""}+{s}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ornamentation">{scale.ornamentation}</Field>
            <Field label="Needs special attention">{scale.attention}</Field>
            <Field label="Approximate Western reference">{scale.western_approx}</Field>
            <div className="rounded-xl border border-amber/25 bg-amber/5 p-4"><div className="text-[10px] uppercase tracking-widest text-amber">Why this is NOT an exact equivalent</div><div className="mt-1 text-sm text-white/75">{scale.why_not_equivalent}</div></div>
          </div>

          <button onClick={() => setShowStaff(!showStaff)} data-testid="ref-toggle-staff" className="mt-4 text-xs text-cyan">{showStaff ? "Hide" : "Show"} tonic-relative semitone map</button>
          {showStaff && <div className="mt-2 font-mono-p text-xs text-white/60" data-testid="ref-staff">Semitones from tonic: [{scale.ascending.join(", ")}]</div>}

          <button onClick={() => toast.success("Saved to your rehearsal / project reference")} data-testid="ref-save" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-600 text-white"><Check className="h-4 w-4" /> Save to project</button>
        </GlassCard>
      )}
      <Disclaimer text={audioNotice || "Synthesized placeholder audio for orientation only — not an authoritative recording."} />
    </div>
  );
}

function RhythmLab() {
  const [data, setData] = useState(null);
  const [sel, setSel] = useState(0);
  const [active, setActive] = useState({});
  const [bpm, setBpm] = useState(100);
  const [stopFn, setStopFn] = useState(null);
  useEffect(() => { api.get("/music/rhythms").then((r) => { setData(r.data); }); }, []);
  useEffect(() => () => { if (stopFn) stopFn(); }, [stopFn]);
  if (!data) return <Loader label="Loading rhythm lab" />;
  const r = data.rhythms[sel];
  const layers = r.layers.filter((_, i) => active[i] !== false);

  const play = () => { if (stopFn) stopFn(); const fn = playRhythm(layers, r.cycle, bpm); setStopFn(() => fn); };
  const stop = () => { if (stopFn) { stopFn(); setStopFn(null); } };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <select value={sel} onChange={(e) => { stop(); setSel(Number(e.target.value)); setActive({}); }} data-testid="rhythm-select" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">{data.rhythms.map((x, i) => <option key={i} value={i} className="bg-[#0B1021]">{x.name}</option>)}</select>
          <div className="flex items-center gap-2 text-xs text-white/50">Tempo <input type="range" min="50" max="160" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} data-testid="rhythm-bpm" /> {bpm} BPM</div>
          <button onClick={play} data-testid="rhythm-play" className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-600 text-white"><Play className="h-4 w-4" /> Play cycle</button>
          <button onClick={stop} data-testid="rhythm-stop" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white"><Square className="h-4 w-4" /> Stop</button>
        </div>
        <p className="mt-3 text-sm text-white/60">{r.note}</p>
      </GlassCard>

      <div className="space-y-3">
        {r.layers.map((L, li) => (
          <GlassCard key={li} className="p-4" data-testid={`rhythm-layer-${li}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="font-600 text-white">{L.name}</span>{L.syllables && L.syllables !== "—" && <span className="font-mono-p text-xs text-white/45">{L.syllables}</span>}</div>
              <button onClick={() => setActive((p) => ({ ...p, [li]: p[li] === false ? true : false }))} data-testid={`rhythm-toggle-${li}`} className={`rounded-full px-3 py-1 text-xs ${active[li] === false ? "bg-white/5 text-white/40" : "bg-cyan/20 text-cyan"}`}>{active[li] === false ? "Off" : "On"}</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {L.pattern.map((v, i) => (
                <div key={i} className={`h-8 w-8 rounded-md text-center text-[10px] leading-8 ${i === r.first_beat ? "ring-1 ring-amber " : ""}${v ? "bg-gradient-to-br from-cyan to-violet text-white" : "bg-white/6 text-white/25"}`}>{i === r.first_beat ? "1" : i + 1}</div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="text-xs text-white/40">The amber-ringed cell marks the first beat / return point ({r.name.includes("clave") ? "clave anchor" : "cycle start"}).</div>
      <Disclaimer text={data.audio_notice} />
    </div>
  );
}

function Instruments() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { api.get("/music/instruments").then((r) => setItems(r.data)); }, []);
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <button key={it.id} onClick={() => setOpen(it)} data-testid={`instrument-${it.id}`} className="text-left">
            <GlassCard hover className="group h-full overflow-hidden">
              <div className="relative h-36 overflow-hidden"><img src={it.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" /><div className="absolute bottom-3 left-4"><div className="font-display text-xl font-600 text-white">{it.name}</div><div className="font-mono-p text-xs text-white/60">{it.local_name} · {it.pronunciation}</div></div></div>
              <div className="p-4 text-sm text-white/60">{it.family} · {it.region}</div>
            </GlassCard>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="mx-auto my-8 max-w-2xl rounded-3xl border border-white/10 bg-[#0B1021] p-6" data-testid="instrument-modal">
            <div className="flex items-start justify-between"><div><h3 className="font-display text-2xl font-600 text-white">{open.name} <span className="text-white/50">{open.local_name}</span></h3><div className="text-sm text-white/50">{open.region} · {open.pronunciation}</div></div><button onClick={() => setOpen(null)} className="text-white/50"><X className="h-5 w-5" /></button></div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Family">{open.family}</Field><Field label="Construction">{open.construction}</Field>
              <Field label="Tuning">{open.tuning}</Field><Field label="Range">{open.range}</Field>
              <Field label="Musical role">{open.role}</Field><Field label="Techniques">{open.techniques}</Field>
              <Field label="Ensemble relationships">{open.ensemble}</Field><Field label="Recording">{open.recording}</Field>
              <Field label="Transport">{open.transport}</Field><Field label="Cultural significance">{open.significance}</Field>
              <Field label="Handling etiquette">{open.etiquette}</Field><Field label="Restrictions / permissions">{open.restrictions}</Field>
            </div>
            <div className="mt-3 rounded-xl border border-cyan/25 bg-cyan/5 p-4"><div className="text-[10px] uppercase tracking-widest text-cyan">Ask the performer before recording</div><ul className="mt-1 space-y-1 text-sm text-white/75">{open.questions.map((q, i) => <li key={i}>• {q}</li>)}</ul></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Rehearsal({ traditions }) {
  const [form, setForm] = useState({ destination: "Mumbai, India", tradition: "hindustani", discipline: "Producer", role: "Producer", engagement: "recording session", repertoire: "", collaborators: "" });
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true); setRes(null); setDone({});
    try { const { data } = await api.post("/music/rehearsal-plan", form); setRes(data); }
    catch { toast.error("Could not generate plan"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Destination" data-testid="reh-destination" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
          <select value={form.tradition} onChange={(e) => set("tradition", e.target.value)} data-testid="reh-tradition" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.name}</option>)}</select>
          <input value={form.discipline} onChange={(e) => set("discipline", e.target.value)} placeholder="Creative discipline" data-testid="reh-discipline" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
          <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Instrument / role" data-testid="reh-role" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
          <input value={form.engagement} onChange={(e) => set("engagement", e.target.value)} placeholder="Type of engagement" data-testid="reh-engagement" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
          <input value={form.repertoire} onChange={(e) => set("repertoire", e.target.value)} placeholder="Repertoire (optional)" data-testid="reh-repertoire" className="rounded-xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none" />
        </div>
        <button onClick={run} disabled={loading} data-testid="reh-generate" className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-6 py-2.5 text-sm font-600 text-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />} Generate preparation pathway</button>
      </GlassCard>

      {res && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" data-testid="reh-result">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ListCard title="Musical vocabulary" items={res.musical_vocabulary} tone="cyan" />
            <ListCard title="Recommended listening" items={res.listening} tone="violet" />
            <TextCard title="Pitch & tuning preparation" text={res.pitch_tuning_prep} />
            <TextCard title="Rhythm preparation" text={res.rhythm_prep} />
            <TextCard title="Cultural background" text={res.cultural_background} />
            <TextCard title="Rehearsal etiquette" text={res.rehearsal_etiquette} />
            <TextCard title="Professional conduct" text={res.professional_conduct} />
            <TextCard title="Instrument considerations" text={res.instrument_considerations} />
            <ListCard title="Questions for the musical director" items={res.director_questions} tone="cyan" />
            <ListCard title="Rights & credit questions" items={res.rights_credit_questions} tone="amber" />
            <ListCard title="Cultural-permission questions" items={res.permission_questions} tone="magenta" />
            <ListCard title="Language practice" items={res.language_practice} tone="violet" />
          </div>
          <GlassCard className="p-6" data-testid="reh-checklist">
            <h4 className="mb-3 font-display text-lg font-600 text-white">Readiness checklist</h4>
            <div className="space-y-2">{(res.readiness_checklist || []).map((c, i) => (
              <button key={i} onClick={() => setDone((p) => ({ ...p, [i]: !p[i] }))} data-testid={`reh-check-${i}`} className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-left text-sm">
                {done[i] ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="h-4 w-4 rounded-full border border-white/30" />}<span className={done[i] ? "text-white/40 line-through" : "text-white/80"}>{c}</span>
              </button>
            ))}</div>
          </GlassCard>
          <Disclaimer text={res.stewardship_notice} />
        </motion.div>
      )}
    </div>
  );
}

function Knowledge({ traditions }) {
  const [instruction, setInstruction] = useState("");
  const [target, setTarget] = useState("hindustani");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    if (!instruction.trim()) { toast.error("Describe a musical idea"); return; }
    setLoading(true); setRes(null);
    try { const { data } = await api.post("/music/knowledge-translate", { instruction, target_tradition: target }); setRes(data); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="translator-frame p-6">
        <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={4} placeholder='e.g. "Give me a bluesy, laid-back feel over these two chords."' data-testid="knowledge-input" className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan/40" />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white/50">Communicate within:</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} data-testid="knowledge-target" className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white outline-none">{traditions.map((t) => <option key={t.id} value={t.id} className="bg-[#0B1021]">{t.short}</option>)}</select>
        </div>
        <button onClick={run} disabled={loading} data-testid="knowledge-run" className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-600 text-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />} Translate the idea</button>
      </div>
      <div>
        {loading && <div className="flex items-center gap-2 text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>}
        {res && (
          <div className="space-y-3" data-testid="knowledge-result">
            <TextCard title="Direct musical reference" text={res.direct_reference} />
            <TextCard title="Approximate comparison" text={res.approximate_comparison} />
            <ListCard title="Important differences" items={res.important_differences} tone="amber" />
            <TextCard title="Rehearsal recommendation" text={res.rehearsal_recommendation} />
            <TextCard title="Cultural context" text={res.cultural_context} />
            <ListCard title="Terminology to avoid" items={res.terminology_to_avoid} tone="magenta" />
            <ListCard title="Questions to ask the practitioner" items={res.questions_to_ask} tone="cyan" />
            <div className="rounded-xl border border-amber/25 bg-amber/5 p-4"><div className="text-[10px] uppercase tracking-widest text-amber">Practitioner verification needed</div><div className="mt-1 text-sm text-white/75">{res.practitioner_verification_needed}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Classroom() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/music/classroom").then((r) => setData(r.data)); }, []);
  if (!data) return <Loader label="Loading classroom" />;
  return (
    <div className="space-y-6">
      <GlassCard className="p-6" data-testid="music-classroom">
        <h3 className="font-display text-2xl font-600 text-white">{data.pathway.title}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.pathway.modules.map((m, i) => (
            <div key={m.id} className="rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 font-mono-p text-xs text-cyan">{i + 1}</span><span className="font-600 text-white">{m.title}</span></div><p className="mt-1 text-sm text-white/55">{m.summary}</p></div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-6" data-testid="music-faculty-tools">
        <h4 className="mb-3 font-600 text-white">Faculty tools</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{data.pathway.faculty_tools.map((f) => <button key={f} onClick={() => toast.success(`${f} (demo)`)} className="rounded-xl border border-white/8 bg-white/4 p-3 text-left text-xs text-white/75 transition hover:border-cyan/40">{f}</button>)}</div>
      </GlassCard>
      <div>
        <h4 className="mb-3 font-display text-lg font-600 text-white">Access tiers <span className="text-xs font-400 text-white/40">(demonstration — no billing)</span></h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.tiers.map((t) => (
            <GlassCard key={t.id} className="p-5" data-testid={`tier-${t.id}`}><div className="font-display text-lg font-600 text-white">{t.name}</div><div className="mt-1 text-xs text-white/45">{t.audience}</div><Pill tone="cyan" className="mt-2">{t.price}</Pill><ul className="mt-3 space-y-1.5 text-xs text-white/65">{t.features.map((f, i) => <li key={i} className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> {f}</li>)}</ul></GlassCard>
          ))}
        </div>
      </div>
      <Disclaimer text={data.stewardship_notice} />
    </div>
  );
}

function Pathways() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { api.get("/music/classroom").then((r) => setList(r.data.demo_pathways)); }, []);
  const load = async (id) => { const { data } = await api.get(`/music/pathways/${id}`); setOpen(data); };
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {list.map((p) => (
          <button key={p.id} onClick={() => load(p.id)} data-testid={`pathway-${p.id}`} className="text-left">
            <GlassCard hover className="group h-full overflow-hidden">
              <div className="relative h-40 overflow-hidden"><img src={p.cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" /><Pill tone="amber" className="absolute left-3 top-3">Demonstration</Pill></div>
              <div className="p-5"><h3 className="font-display text-lg font-600 leading-snug text-white">{p.title}</h3></div>
            </GlassCard>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="mx-auto my-8 max-w-3xl rounded-3xl border border-white/10 bg-[#0B1021]" data-testid="pathway-modal">
            <div className="relative h-48"><img src={open.cover} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" /><button onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white"><X className="h-5 w-5" /></button><h2 className="absolute bottom-4 left-6 max-w-xl font-display text-2xl font-700 text-white">{open.title}</h2></div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
              <Field label="Musical-system overview">{open.system_overview}</Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ListCard title="Listening preparation" items={open.listening} tone="violet" />
                <ListCard title="Rehearsal vocabulary" items={open.rehearsal_vocab} tone="cyan" />
                <Field label="Pitch reference">{open.pitch_reference}</Field>
                <Field label="Rhythm reference">{open.rhythm_reference}</Field>
                <Field label="Professional etiquette">{open.etiquette}</Field>
                <Field label="Cultural considerations">{open.cultural}</Field>
                <ListCard title="Rights & credit questions" items={open.rights} tone="amber" />
                <Field label="Cultural permissions">{open.permissions}</Field>
              </div>
              <GlassCard className="p-5"><h4 className="mb-2 font-600 text-white">Interactive readiness checklist</h4><div className="space-y-2">{open.checklist.map((c, i) => <ChecklistRow key={i} label={c} idx={i} />)}</div></GlassCard>
              <Disclaimer text={open.stewardship_notice} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({ label, idx }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => setDone(!done)} data-testid={`pathway-check-${idx}`} className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-left text-sm">
      {done ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="h-4 w-4 rounded-full border border-white/30" />}<span className={done ? "text-white/40 line-through" : "text-white/80"}>{label}</span>
    </button>
  );
}
