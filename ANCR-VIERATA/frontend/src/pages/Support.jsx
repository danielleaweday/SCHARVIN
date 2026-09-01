import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { LifeBuoy, Send, Info, Loader2 } from "lucide-react";

const KIND_LABEL = {
  program: "Program",
  mentor: "Mentor",
  nutrition: "Nutrition",
  mental_health: "Mental health",
  medical: "Medical",
  accessibility: "Accessibility",
  crisis: "Crisis",
  disclaimer: "Notice",
};

const KIND_COLOR = {
  program: "#14B8A6", mentor: "#9333EA", nutrition: "#EA580C",
  mental_health: "#9333EA", medical: "#E11D48", accessibility: "#D97706",
  crisis: "#E11D48", disclaimer: "#14B8A6",
};

export default function Support() {
  const [resources, setResources] = useState([]);
  const [mine, setMine] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    api.get("/support/resources").then(({ data }) => setResources(data.items));
    api.get("/support/messages").then(({ data }) => setMine(data.items));
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (subject.trim().length < 2 || body.trim().length < 2) { toast.message("Add a subject and message"); return; }
    setSending(true);
    try {
      await api.post("/support/messages", { subject, body, resource_id: resourceId || null });
      toast.success("Message sent to the VIEARTA team");
      setSubject(""); setBody(""); setResourceId(""); load();
    } catch { toast.error("Couldn't send just now"); } finally { setSending(false); }
  };

  return (
    <div className="fade-up" data-testid="support-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#E11D48" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <LifeBuoy className="w-3.5 h-3.5" /> Support & resources
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            You do not have to <span className="viearta-gradient">carry it alone.</span>
          </h1>
          <p className="text-white/65 mt-4 max-w-2xl">VIEARTA is educational — not a medical or therapeutic service. Add professional care as you need it.</p>
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-4">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="support-resources">
          {resources.map((r) => {
            const color = KIND_COLOR[r.kind] || "#14B8A6";
            return (
              <div key={r.id} data-testid={`support-res-${r.id}`} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color }}>{KIND_LABEL[r.kind]}</div>
                <div className="font-display text-lg mt-1">{r.title}</div>
                <div className="text-sm text-white/60 mt-1">{r.description}</div>
                <button onClick={() => setResourceId(r.id)}
                  className={`mt-3 rounded-full px-3 py-1.5 text-xs border ${resourceId === r.id ? "bg-white/10 border-white/40" : "border-white/10 text-white/60 hover:text-white/85"}`}>
                  {resourceId === r.id ? "Selected" : "Reference in message"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-3">Send a message</h2>
        <p className="text-white/60 text-sm mb-4">Only the VIEARTA team sees these messages. Include any resource you'd like referenced.</p>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
          data-testid="support-subject"
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-white/30 mb-3" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What would you like help with?"
          data-testid="support-body" rows={5}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-white/30" />
        {resourceId && (
          <div className="mt-3 text-xs text-white/55 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Referencing: {resources.find((x) => x.id === resourceId)?.title}</div>
        )}
        <div className="mt-4 flex items-center justify-end">
          <button onClick={send} disabled={sending} data-testid="support-send"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
          </button>
        </div>
      </section>

      {mine.length > 0 && (
        <section className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl mb-3">Your recent messages</h2>
          <ul className="space-y-2">
            {mine.map((m) => (
              <li key={m.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-xs text-white/45">
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                  <span className="uppercase tracking-[0.2em]">{m.status}</span>
                </div>
                <div className="font-display text-lg mt-1">{m.subject}</div>
                <div className="text-sm text-white/70 mt-1">{m.body}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
