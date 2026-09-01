import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Fingerprint,
  BadgeCheck,
  Globe2,
  Check,
  Music2,
  Wallet,
  Rocket,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const STEPS = [
  {
    icon: Fingerprint,
    label: "Authenticating with ANCRID™",
    detail: "Verifying your creator credentials",
  },
  {
    icon: ShieldCheck,
    label: "Identity Verification",
    detail: "Cross-checking discipline, role, and geo",
  },
  {
    icon: BadgeCheck,
    label: "Loading Creative Passport™",
    detail: "Fetching verified history, credits, and collaborations",
  },
  {
    icon: Globe2,
    label: "Connecting to the ecosystem",
    detail: "Syncing ANCRLAB™, INHEIRA™, Vaulta™, ANCRLaunch™, ANCRA™",
  },
];

const PRODUCT_ROWS = [
  { key: "ancrsync", label: "ANCRSync™", icon: Globe2, color: "#007AFF", fmt: (p) => `${p.workspaces} workspaces · ${p.sessions} sessions` },
  { key: "ancrlab", label: "ANCRLAB™", icon: Music2, color: "#10B981", fmt: (p) => `${p.projects} projects · ${p.tracks} tracks` },
  { key: "inheira", label: "INHEIRA™", icon: Layers, color: "#F59E0B", fmt: (p) => `${p.works_registered} works · ${p.credits} credits` },
  { key: "vaulta", label: "Vaulta™", icon: Wallet, color: "#22D3EE", fmt: (p) => `$${p.balance_usd.toLocaleString()} · $${p.royalties_pending} pending` },
  { key: "ancrlaunch", label: "ANCRLaunch™", icon: Rocket, color: "#EC4899", fmt: (p) => `${p.releases} releases · ${p.campaigns} campaigns` },
  { key: "ancra", label: "ANCRA™", icon: GraduationCap, color: "#8B5CF6", fmt: (p) => `${p.courses_active} courses · ${p.completed} completed` },
];

export default function ANCRIDVerify() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      nav("/login", { replace: true });
      return;
    }
    if (!user) return;
    // Kick off cross-product fetch in parallel
    api.get("/ancrid/verify").then((r) => setPayload(r.data)).catch(() => {});
    const iv = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          clearInterval(iv);
          setTimeout(() => nav("/dashboard", { replace: true }), 1400);
          return s;
        }
        return s + 1;
      });
    }, 750);
    return () => clearInterval(iv);
  }, [user, loading, nav]);

  return (
    <div className="min-h-screen bg-black text-zinc-50 relative flex items-center justify-center overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#007AFF]/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/[0.07] blur-[140px]" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[620px] h-[620px]">
          <div className="absolute inset-0 rounded-full border border-white/[0.04] orbit" />
          <div
            className="absolute inset-10 rounded-full border border-white/[0.06] orbit"
            style={{ animationDirection: "reverse", animationDuration: "60s" }}
          />
          <div className="absolute inset-20 rounded-full border border-white/[0.08]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dot-pulse" />
            <span className="text-[11px] tracking-overline text-zinc-300">
              ANCR Identity Layer
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-medium">
            Verifying with ANCRID
            <span className="text-[#007AFF] text-lg align-super">™</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            One identity for the entire creative ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Steps */}
          <div className="glass-strong rounded-3xl p-5 space-y-2" data-testid="ancrid-verify">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "pending";
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`ancrid-step-${i}`}
                  className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
                    state === "active"
                      ? "bg-[#007AFF]/[0.08] border border-[#007AFF]/30"
                      : state === "done"
                      ? "bg-white/[0.02] border border-white/[0.05]"
                      : "border border-transparent opacity-40"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      state === "done"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : state === "active"
                        ? "bg-[#007AFF] text-white accent-glow"
                        : "bg-white/[0.05] text-zinc-500"
                    }`}
                  >
                    {state === "done" ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-100 font-medium">
                      {s.label}
                    </div>
                    <div className="text-[11px] text-zinc-500">{s.detail}</div>
                  </div>
                  {state === "active" && (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1 h-1 rounded-full bg-[#007AFF] dot-pulse"
                          style={{ animationDelay: `${d * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Cross-product panel */}
          <div className="glass-strong rounded-3xl p-5">
            <div className="text-[10px] tracking-overline text-zinc-500 mb-3">
              Ecosystem Snapshot
            </div>
            <div className="space-y-2">
              {PRODUCT_ROWS.map((row) => {
                const p = payload?.products?.[row.key];
                return (
                  <motion.div
                    key={row.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: p ? 1 : 0.3 }}
                    className="flex items-center gap-3 rounded-xl p-2.5 border border-white/[0.04]"
                    data-testid={`ecosystem-${row.key}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${row.color}22`, color: row.color }}
                    >
                      <row.icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-100 truncate">
                        {row.label}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 truncate">
                        {p ? row.fmt(p) : "Fetching…"}
                      </div>
                    </div>
                    {p && (
                      <span
                        className={`text-[9px] tracking-overline px-2 py-0.5 rounded-full ${
                          p.status === "active"
                            ? "text-emerald-300 bg-emerald-500/10"
                            : "text-[#F59E0B] bg-[#F59E0B]/10"
                        }`}
                      >
                        {p.status}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {user && (
          <AnimatePresence>
            <motion.div
              key="ident"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center justify-center gap-3 text-xs font-mono text-zinc-500 flex-wrap"
              data-testid="ancrid-footer"
            >
              <span
                className="w-6 h-6 rounded-full"
                style={{ background: user.avatar_color }}
              />
              <span className="text-zinc-300">{user.name}</span>
              <span>·</span>
              <span className="text-[#007AFF]">
                {payload?.ancrid || `ANCR-${user.id.slice(0, 8).toUpperCase()}`}
              </span>
              <span>·</span>
              <span>{user.discipline}</span>
              {payload?.geo && (
                <>
                  <span>·</span>
                  <span>
                    {payload.geo.flag} {payload.geo.city}
                  </span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
