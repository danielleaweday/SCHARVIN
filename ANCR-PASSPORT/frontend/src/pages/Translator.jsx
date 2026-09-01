import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, Mic, Camera, Music, MessageSquare, ArrowLeftRight, Volume2,
  Bookmark, Sparkles, Loader2, Send, Upload, Search, FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Pill, Disclaimer } from "@/components/common";

const LANGS = ["English", "Japanese", "Korean", "French", "Portuguese", "Spanish", "Twi", "German", "Mandarin"];
const REVIEW = "AI-assisted translations should be reviewed by a fluent speaker or qualified cultural consultant before commercial release or public performance.";

const MODES = [
  { id: "conversation", label: "Conversation", icon: MessageSquare },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "creative", label: "Creative Language", icon: Sparkles },
  { id: "lyrics", label: "Music + Lyric", icon: Music },
];

const speak = (text, lang) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    const map = { Japanese: "ja-JP", Korean: "ko-KR", French: "fr-FR", Portuguese: "pt-BR", Spanish: "es-ES", German: "de-DE", Mandarin: "zh-CN", English: "en-US" };
    u.lang = map[lang] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { toast.error("Pronunciation not available on this device"); }
};

const LangPicker = ({ source, target, setSource, setTarget }) => (
  <div className="flex items-center gap-2">
    <select data-testid="source-lang" value={source} onChange={(e) => setSource(e.target.value)} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">
      {LANGS.map((l) => <option key={l} className="bg-[#0B1021]">{l}</option>)}
    </select>
    <button data-testid="swap-langs" onClick={() => { setSource(target); setTarget(source); }} className="rounded-full border border-white/12 bg-white/5 p-2 text-cyan transition hover:rotate-180 duration-500">
      <ArrowLeftRight className="h-4 w-4" />
    </button>
    <select data-testid="target-lang" value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white outline-none">
      {LANGS.map((l) => <option key={l} className="bg-[#0B1021]">{l}</option>)}
    </select>
  </div>
);

export default function Translator() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "conversation");
  const [source, setSource] = useState("English");
  const [target, setTarget] = useState("Japanese");

  return (
    <div data-testid="translator-page">
      <PageHeader
        eyebrow="Signature Feature"
        title={<span>Language <span className="grad-text">+ Music</span> Translator</span>}
        subtitle="An intelligent, culturally-aware translation studio built for creatives — conversation, signage, rehearsal vocabulary and performance-ready lyric adaptation."
        testid="translator-header"
      />

      <div className="mb-6 flex flex-wrap gap-2" data-testid="translator-modes">
        {MODES.map((m) => (
          <button
            key={m.id} onClick={() => setMode(m.id)} data-testid={`mode-${m.id}`}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-600 transition-all duration-300 ${
              mode === m.id ? "bg-gradient-to-r from-cyan to-violet text-white shadow-[0_0_24px_-6px_rgba(139,92,246,0.7)]" : "border border-white/12 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <m.icon className="h-4 w-4" /> {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
          {mode === "conversation" && <Conversation source={source} target={target} setSource={setSource} setTarget={setTarget} />}
          {mode === "camera" && <CameraMode />}
          {mode === "creative" && <Creative source={source} target={target} setSource={setSource} setTarget={setTarget} />}
          {mode === "lyrics" && <Lyrics source={source} target={target} setSource={setSource} setTarget={setTarget} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Wave({ active }) {
  return (
    <div className={`soundwave flex h-6 items-end transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ height: 20, animationDelay: `${i * 0.09}s`, animationPlayState: active ? "running" : "paused" }} />)}
    </div>
  );
}

function Conversation({ source, target, setSource, setTarget }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => { api.get("/phrases").then((r) => setHistory(r.data)); }, []);

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/translate", { text, source_lang: source, target_lang: target, mode: "conversation" });
      setResult(data);
    } catch { toast.error("Translation failed. Please try again."); }
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    const { data } = await api.post("/phrases", { original: text, translated: result.translated, source_lang: source, target_lang: target, pronunciation: result.pronunciation });
    setHistory((h) => [data, ...h]);
    toast.success("Phrase saved");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="translator-frame p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <LangPicker source={source} target={target} setSource={setSource} setTarget={setTarget} />
            <Wave active={loading} />
          </div>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="Type or simulate speaking…" data-testid="conversation-input"
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/35 outline-none focus:border-cyan/40"
          />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { setText((t) => t || "Where is the recording studio?"); toast("Simulated microphone input"); }} data-testid="conversation-mic" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:text-white">
              <Mic className="h-4 w-4" /> Speak
            </button>
            <button onClick={translate} disabled={loading} data-testid="conversation-translate" className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-6 py-2.5 text-sm font-600 text-white transition hover:brightness-110 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Translate
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl border border-cyan/25 bg-cyan/5 p-5" data-testid="conversation-result">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-cyan/70">{target}</div>
                    <div className="mt-1 font-display text-2xl font-600 text-white">{result.translated}</div>
                    <div className="mt-1 font-mono-p text-sm text-white/55">{result.pronunciation}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => speak(result.translated, target)} data-testid="play-pronunciation" className="rounded-full border border-white/12 bg-white/5 p-2.5 text-cyan transition hover:bg-white/10"><Volume2 className="h-4 w-4" /></button>
                    <button onClick={save} data-testid="save-phrase" className="rounded-full border border-white/12 bg-white/5 p-2.5 text-violet transition hover:bg-white/10"><Bookmark className="h-4 w-4" /></button>
                  </div>
                </div>
                {result.literal_note && <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/55"><span className="text-white/70">Nuance:</span> {result.literal_note}</p>}
                {result.formality && <Pill tone="violet" className="mt-3">{result.formality}</Pill>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GlassCard className="p-5" data-testid="conversation-history">
        <h3 className="mb-3 font-display text-lg font-600 text-white">Saved Phrases</h3>
        {history.length === 0 && <p className="text-sm text-white/45">Your saved phrases will appear here.</p>}
        <div className="space-y-2.5">
          {history.map((h) => (
            <div key={h.id} className="rounded-xl border border-white/8 bg-white/4 p-3">
              <div className="text-sm text-white">{h.translated}</div>
              <div className="font-mono-p text-[11px] text-white/45">{h.original}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function CameraMode() {
  const [extracted, setExtracted] = useState(null);
  const simulate = () => {
    setExtracted({
      original: "本日の公演は19時30分開演です。開場は19時。",
      translated: "Today's performance begins at 7:30 PM. Doors open at 7:00 PM.",
    });
    toast("Simulated OCR — demonstration only");
  };
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="translator-frame flex flex-col items-center justify-center p-10 text-center" data-testid="camera-mode">
        <div className="rounded-2xl border border-dashed border-white/20 p-10">
          <Camera className="mx-auto h-12 w-12 text-cyan" strokeWidth={1.4} />
          <p className="mt-4 text-white/70">Translate signs, menus, schedules & documents</p>
          <button onClick={simulate} data-testid="camera-upload" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-600 text-white">
            <Upload className="h-4 w-4" /> Simulate image upload
          </button>
        </div>
        <Pill tone="amber" className="mt-5">Demonstration — OCR not connected</Pill>
      </div>
      <GlassCard className="p-6">
        <h3 className="mb-4 font-display text-lg font-600 text-white">Extracted Text</h3>
        {!extracted ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-sm text-white/40">Upload an image to see extracted & translated text</div>
        ) : (
          <div className="space-y-4" data-testid="camera-result">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/40">Detected</div>
              <div className="mt-1 text-white/80">{extracted.original}</div>
            </div>
            <div className="rounded-xl border border-cyan/25 bg-cyan/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-cyan/70">Translation</div>
              <div className="mt-1 font-600 text-white">{extracted.translated}</div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Creative({ source, target, setSource, setTarget }) {
  const [q, setQ] = useState("");
  const [phrases, setPhrases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = (query) => api.get("/creative-phrases", { params: query ? { q: query } : {} }).then((r) => setPhrases(r.data));
  useEffect(() => { load(""); }, []);

  const translate = async (phrase) => {
    setSelected(phrase); setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/translate", { text: phrase, source_lang: source, target_lang: target, mode: "creative" });
      setResult(data);
    } catch { toast.error("Translation failed"); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <LangPicker source={source} target={target} setSource={setSource} setTarget={setTarget} />
        </div>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={q} onChange={(e) => { setQ(e.target.value); load(e.target.value); }} placeholder="Search music, film, dance, business vocabulary" data-testid="creative-search" className="w-full rounded-full border border-white/12 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan/50" />
        </div>
        <div className="space-y-2.5" data-testid="creative-phrases">
          {phrases.map((p, i) => (
            <button key={i} onClick={() => translate(p.text)} data-testid={`creative-phrase-${i}`} className={`w-full rounded-xl border p-4 text-left transition ${selected === p.text ? "border-cyan/50 bg-cyan/8" : "border-white/8 bg-white/4 hover:border-white/20"}`}>
              <Pill tone="violet" className="mb-2">{p.category}</Pill>
              <div className="text-sm text-white/85">{p.text}</div>
            </button>
          ))}
        </div>
      </div>
      <GlassCard className="translator-frame p-6">
        <h3 className="mb-4 font-display text-lg font-600 text-white">Translation</h3>
        {loading && <div className="flex items-center gap-2 text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Translating…</div>}
        {!loading && !result && <p className="text-sm text-white/45">Select a phrase to translate it into {target}.</p>}
        {result && (
          <div data-testid="creative-result">
            <div className="text-[10px] uppercase tracking-widest text-white/40">{source}</div>
            <div className="text-white/70">{result.text}</div>
            <div className="mt-4 text-[10px] uppercase tracking-widest text-cyan/70">{target}</div>
            <div className="font-display text-2xl font-600 text-white">{result.translated}</div>
            <div className="mt-1 font-mono-p text-sm text-white/55">{result.pronunciation}</div>
            <button onClick={() => speak(result.translated, target)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cyan"><Volume2 className="h-4 w-4" /> Pronounce</button>
            {result.literal_note && <p className="mt-3 text-xs text-white/55">{result.literal_note}</p>}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Lyrics({ source, target, setSource, setTarget }) {
  const [lyrics, setLyrics] = useState("");
  const [purpose, setPurpose] = useState("Literal Translation");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const PURPOSES = ["Literal Translation", "Cultural Interpretation", "Performance-Ready Adaptation"];

  const translate = async () => {
    if (!lyrics.trim()) { toast.error("Enter some lyrics first"); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/translate/lyrics", { lyrics, source_lang: source, target_lang: target, purpose });
      setResult(data);
    } catch { toast.error("Lyric translation failed"); }
    setLoading(false);
  };

  const saveProject = () => toast.success("Translation saved to your creative project");

  return (
    <div className="space-y-6">
      <div className="translator-frame p-6" data-testid="lyrics-mode">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LangPicker source={source} target={target} setSource={setSource} setTarget={setTarget} />
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map((p) => (
              <button key={p} onClick={() => setPurpose(p)} data-testid={`purpose-${p.split(" ")[0].toLowerCase()}`} className={`rounded-full px-3.5 py-1.5 text-xs font-600 transition ${purpose === p ? "bg-magenta/20 text-magenta border border-magenta/40" : "border border-white/12 bg-white/5 text-white/55"}`}>{p}</button>
            ))}
          </div>
        </div>
        <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={6} placeholder={"Enter lyrics…\ne.g. We're chasing the neon skyline tonight"} data-testid="lyrics-input" className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 font-mono-p text-sm text-white placeholder:text-white/35 outline-none focus:border-magenta/40" />
        <button onClick={translate} disabled={loading} data-testid="lyrics-translate" className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-magenta px-6 py-2.5 text-sm font-600 text-white transition hover:brightness-110 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />} Translate lyrics
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="lyrics-result">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlassCard className="p-6">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{source} · Original</div>
              <pre className="mt-3 whitespace-pre-wrap font-mono-p text-sm text-white/70">{result.lyrics}</pre>
            </GlassCard>
            <GlassCard className="border-magenta/20 p-6">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-magenta/70">{target} · {result.purpose}</div>
                <button onClick={() => speak(result.translated, target)} className="rounded-full border border-white/12 bg-white/5 p-2 text-magenta"><Volume2 className="h-4 w-4" /></button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-display text-base leading-relaxed text-white">{result.translated}</pre>
              {result.pronunciation && <p className="mt-3 border-t border-white/10 pt-3 font-mono-p text-xs text-white/50">{result.pronunciation}</p>}
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <GlassCard className="p-5">
              <h4 className="mb-3 font-600 text-white">Idioms & References</h4>
              {(result.idioms || []).length === 0 ? <p className="text-xs text-white/45">No notable idioms detected.</p> : (
                <div className="space-y-3">
                  {result.idioms.map((it, i) => (
                    <div key={i}><div className="text-sm font-600 text-cyan">{it.phrase}</div><div className="text-xs text-white/60">{it.explanation}</div></div>
                  ))}
                </div>
              )}
            </GlassCard>
            <GlassCard className="p-5">
              <h4 className="mb-3 font-600 text-white">Syllables & Phrasing</h4>
              <div className="flex items-center gap-4">
                <div><div className="text-[10px] uppercase text-white/40">Source</div><div className="font-mono-p text-2xl text-white">{result.syllables?.source ?? "—"}</div></div>
                <div className="text-white/30">→</div>
                <div><div className="text-[10px] uppercase text-white/40">Target</div><div className="font-mono-p text-2xl text-magenta">{result.syllables?.target ?? "—"}</div></div>
              </div>
              {result.phrasing_note && <p className="mt-3 text-xs text-white/60">{result.phrasing_note}</p>}
            </GlassCard>
            <GlassCard className="border-amber/25 p-5">
              <h4 className="mb-3 flex items-center gap-2 font-600 text-amber">Sensitivity Flags</h4>
              {(result.flags || []).length === 0 ? <p className="text-xs text-white/50">No content flagged as offensive, misleading, or culturally inappropriate.</p> : (
                <ul className="space-y-2">
                  {result.flags.map((f, i) => <li key={i} className="text-xs text-amber/90">⚠ {f}</li>)}
                </ul>
              )}
            </GlassCard>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button onClick={saveProject} data-testid="lyrics-save-project" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-600 text-white transition hover:border-cyan/50">
              <FileText className="h-4 w-4" /> Save to creative project
            </button>
          </div>
          <Disclaimer text={REVIEW} />
        </motion.div>
      )}
      {!result && <Disclaimer text={REVIEW} />}
    </div>
  );
}
