import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Sparkles, Lightbulb, ClipboardList, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { kind: "portfolio_gap", icon: ClipboardList, label: "Portfolio Gap Analysis",
    prompt: "Analyze portfolio gaps across my current supervised students and suggest which mentors should be engaged. Reference ANCRLAB™ and INHEIRA™ signals." },
  { kind: "career_readiness", icon: TrendingUp, label: "Career Readiness Snapshot",
    prompt: "Provide a career readiness snapshot for Danielle McMillan. Highlight strengths, gaps, and 5 action items connecting to the ANCR ecosystem." },
  { kind: "mentor_match", icon: Users, label: "Mentor Match Recommendations",
    prompt: "Recommend three mentor matches for a songwriting-focused CCDP student targeting a publishing deal in the next 12 months." },
  { kind: "meeting_summary", icon: Lightbulb, label: "Meeting Summary + Action Items",
    prompt: "Summarize a portfolio review meeting where a professor and a producer evaluated an EP. Include decisions and next-step action items." },
];

export default function AIAH() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [kind, setKind] = useState(PRESETS[0].kind);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState([]);

  const load = () => api.get("/aiah/recent").then(({ data }) => setHistory(data));
  useEffect(() => { load(); }, []);

  const run = async () => {
    setBusy(true); setOutput("");
    try {
      const { data } = await api.post("/aiah/generate", { kind, prompt, context: "aiah_page" });
      setOutput(data.output);
      load();
    } catch (e) { toast.error("AIAH request failed"); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">AI Leadership Intelligence</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white flex items-center gap-3">
          AIAH <Sparkles className="w-8 h-8 text-[#00F0FF]" />
        </h1>
        <p className="text-zinc-500 max-w-2xl mt-2 text-sm">
          Reasoning across the ANCR ecosystem — portfolios, collaborations, publishing metadata, ventures — with human leadership always in the loop.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((p) => (
          <button key={p.kind} data-testid={`aiah-preset-${p.kind}`}
            onClick={() => { setKind(p.kind); setPrompt(p.prompt); }}
            className={`glass-interactive p-4 text-left ${kind === p.kind ? "border-[#00F0FF]/40" : ""}`}>
            <p.icon className="w-5 h-5 text-[#00F0FF] mb-2" />
            <div className="wordmark text-white text-sm leading-tight">{p.label}</div>
          </button>
        ))}
      </div>

      <div className="glass-panel p-6 space-y-4">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
          data-testid="aiah-prompt-input"
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white outline-none" />
        <div className="flex gap-2">
          <button onClick={run} disabled={busy} data-testid="aiah-run-btn" className="btn-primary text-sm">
            {busy ? "AIAH is thinking…" : "Run AIAH"}
          </button>
          <button onClick={() => setOutput("")} className="btn-outline text-sm">Clear</button>
        </div>
        {output && (
          <div className="glass-interactive p-5 whitespace-pre-wrap text-zinc-200 leading-relaxed text-sm">{output}</div>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass-panel p-6">
          <div className="wordmark text-xl text-white mb-4">Recent Insights</div>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="glass-interactive p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{h.kind.replace(/_/g, " ")}</div>
                <div className="text-white text-sm font-semibold mb-2">{h.prompt.slice(0, 140)}{h.prompt.length > 140 ? "…" : ""}</div>
                <div className="text-zinc-400 text-xs line-clamp-3 whitespace-pre-wrap">{h.output}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
