import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SectionTitle } from "@/components/GlassCard";
import { KeyRound, Copy, Check, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

export default function SSO() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [token, setToken] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [grants, setGrants] = useState([]);

  useEffect(() => {
    api.get("/sso/clients").then(r => setClients(r.data.items));
    api.get("/sso/grants").then(r => setGrants(r.data.items));
  }, []);

  async function authorize(client) {
    setLoading(true); setToken(null); setVerification(null);
    setSelected(client);
    try {
      const { data } = await api.post("/sso/authorize", { client_id: client.client_id });
      setToken(data);
      toast.success(`Handshake with ${client.name} authorised`);
      const grantsRes = await api.get("/sso/grants");
      setGrants(grantsRes.data.items);
    } catch (e) {
      toast.error("Authorization failed");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!token) return;
    try {
      const { data } = await api.post("/sso/verify", { token: token.id_token });
      setVerification(data);
      toast.success("SSO token verified by partner");
    } catch {
      toast.error("Verification failed");
    }
  }

  async function copyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token.id_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-8" data-testid="sso-page">
      <SectionTitle
        eyebrow="SSO Handshake · Partner Authentication"
        title="Every ANCR module signs in through your ANCRID."
        testid="sso-title"
      />

      <div className="glass rounded-3xl p-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center shrink-0">
            <KeyRound size={18} className="text-[#00e5ff]" />
          </div>
          <div>
            <div className="font-display text-xl text-white tracking-tight">How it works</div>
            <div className="text-white/60 text-sm leading-relaxed mt-2 max-w-3xl">
              An ANCR partner module (ANCRLAB, ANCRSync, INHEIRA…) requests a scoped SSO token from ANCRID. The token is a short-lived JWT (5 minutes)
              containing your ANCRID number, handle, verification status and the scopes that module is allowed to read. Partners then call
              <span className="font-mono text-white/80"> POST /api/sso/verify </span> to validate the token and hydrate a session.
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">Registered Modules</div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.client_id} data-testid={`sso-client-${c.client_id}`} className="glass rounded-2xl p-5 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{c.client_id}</div>
                  <div className="font-display text-lg tracking-tight text-white mt-1">{c.name}</div>
                  <div className="text-white/50 text-xs mt-1">{c.purpose}</div>
                </div>
                <button
                  data-testid={`sso-authorize-${c.client_id}`}
                  onClick={() => authorize(c)}
                  disabled={loading}
                  className="text-xs bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white rounded-full px-3 py-1.5 transition-colors"
                >
                  Authorize
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Scope</div>
                <div className="font-mono text-xs text-white/80 mt-1">{c.scope}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {token && (
        <div className="glass-strong rounded-3xl p-7" data-testid="sso-token-card">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">Issued SSO Token</div>
              <div className="font-display text-2xl tracking-tight text-white mt-1">→ {token.client_name}</div>
              <div className="font-mono text-[11px] text-white/50 mt-1">Scope: {token.scope} · Expires in {token.expires_in}s</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copyToken} data-testid="sso-copy" className="inline-flex items-center gap-2 text-xs bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white rounded-full px-3 py-2">
                {copied ? <Check size={13} className="text-[#00e5ff]" /> : <Copy size={13} />} {copied ? "Copied" : "Copy token"}
              </button>
              <button onClick={verify} data-testid="sso-verify" className="inline-flex items-center gap-2 text-xs bg-white text-black rounded-full px-3 py-2 hover:bg-white/90">
                <Zap size={13} /> Verify as partner
              </button>
            </div>
          </div>
          <pre className="mt-4 font-mono text-[11px] leading-relaxed text-white/70 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap break-all" data-testid="sso-token-preview">
            {token.id_token}
          </pre>
          {verification && (
            <div className="mt-4 border border-[#00e5ff]/30 bg-[#00e5ff]/5 rounded-2xl p-4" data-testid="sso-verification">
              <div className="flex items-center gap-2 text-[#00e5ff] font-mono text-[10px] tracking-[0.28em] uppercase">
                <ShieldCheck size={12} /> Verified by ANCRID
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(verification.claims || {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <div className="font-mono text-white/40 uppercase tracking-[0.18em] w-24 shrink-0">{k}</div>
                    <div className="text-white/85 font-mono break-all">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">Grant History</div>
        <div className="glass rounded-3xl overflow-hidden">
          {grants.length === 0 ? (
            <div className="p-8 text-white/40 text-sm font-mono tracking-[0.2em] uppercase text-center">No grants issued yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {grants.map((g, i) => (
                <div key={g.grant_id || i} className="grid grid-cols-12 gap-3 px-6 py-4 items-center" data-testid={`grant-${i}`}>
                  <div className="col-span-4 md:col-span-3 font-mono text-[10px] tracking-[0.2em] uppercase text-white/60">{g.client_id}</div>
                  <div className="col-span-8 md:col-span-6 font-mono text-[11px] text-white/60">{g.issued_at}</div>
                  <div className="col-span-12 md:col-span-3 md:text-right font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">Expires {g.expires_at?.slice(11,19)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
