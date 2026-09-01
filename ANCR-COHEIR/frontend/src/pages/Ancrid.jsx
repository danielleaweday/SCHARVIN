import React from "react";
import { useAuth } from "@/lib/auth";
import { Fingerprint, BadgeCheck, ShieldCheck } from "lucide-react";

export default function Ancrid() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ANCRID™</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Your verified identity across the ecosystem.</h1>
      </header>
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-gradient-cohesion opacity-15 blur-3xl" />
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-2 ring-white/10">
            {user.picture ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" /> :
              <div className="w-full h-full bg-gradient-cohesion" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00F0FF] verified-dot" />
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">ANCRID Passport</div>
            </div>
            <div className="wordmark text-5xl mt-2">{user.name}</div>
            <div className="mt-2 font-mono text-sm text-[#00F0FF] flex items-center gap-2"><Fingerprint className="w-4 h-4" /> {user.ancrid}</div>
            <div className="mt-3 text-zinc-400">{user.title || user.role?.replace(/_/g, " ")} · {user.institution || user.company || "—"}</div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {["ANCRID™", "ANCRLAB™", "ANCRSync™", "INHEIRA™", "Vaulta™", "ANCRLaunch™"].map((n) => (
            <div key={n} className="glass-interactive p-4 flex items-center gap-3">
              <BadgeCheck className="w-4 h-4 text-[#00F0FF] verified-dot" />
              <div>
                <div className="wordmark text-white text-sm">{n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Linked · Verified</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
