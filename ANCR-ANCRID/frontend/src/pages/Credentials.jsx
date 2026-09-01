import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { ShieldCheck } from "lucide-react";

export default function Credentials() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/ancrid/credentials").then(r => setItems(r.data.items)); }, []);

  return (
    <div className="space-y-8" data-testid="credentials-page">
      <SectionTitle eyebrow="Credentials · Verifications" title="Signatures behind your identity." testid="credentials-title" />

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((c, i) => (
          <div key={i} data-testid={`credential-${i}`} className="glass rounded-2xl p-5 flex items-start gap-4 hover-lift">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-[#00e5ff]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm">{c.name}</div>
              <div className="text-white/50 text-xs mt-0.5">Issued by {c.issuer} · {c.date}</div>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full px-2.5 py-1 shrink-0">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
