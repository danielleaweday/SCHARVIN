import React from "react";
import { Link } from "react-router-dom";
import { AncrMark, ANCR_LOGO } from "./BrandLogo";

const MODULES = [
  { name: "ANCRA",     to: "/ancra" },
  { name: "ANCRLAB",   to: "/ancrlab" },
  { name: "ANCRSync",  to: "/ancrsync" },
  { name: "COHEIR",    to: "/coheir" },
  { name: "ANCRD",     to: "/feed" },
  { name: "INHEIRA",   to: "/inheira" },
  { name: "Vaulta",    to: "/vaulta" },
  { name: "ANCRMEDIA", to: "/ancrmedia" },
  { name: "ANCRLaunch", to: "/ancrlaunch" },
  { name: "ANCRID",    to: "/ancrid" },
];

export default function EcosystemFooter() {
  return (
    <footer
      data-testid="ecosystem-footer"
      className="mt-16 border-t border-white/5 relative overflow-hidden"
    >
      {/* faint gradient wash */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #3B82F6 20%, #A855F7 50%, #EC4899 75%, #F97316 90%, transparent)" }}
      />
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
              Part of the Ecosystem
            </div>
            <img
              src={ANCR_LOGO}
              alt="ANCR"
              data-testid="footer-ancr-logo"
              className="w-[220px] h-auto select-none -ml-2 mb-4"
              style={{ mixBlendMode: "screen" }}
              draggable="false"
            />
            <div className="font-display text-2xl font-black tracking-tighter mb-3 leading-tight">
              One identity. Ten modules.<br/>
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, #60A5FA 0%, #A855F7 40%, #EC4899 70%, #F97316 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                The future of creative careers.
              </span>
            </div>
            <p className="text-white/50 text-sm max-w-md">
              ANCRD™ is the global professional social network of the Contemporary
              Creative Development Program — powered by ANCRID™ identity, INHEIRA™
              publishing, COHEIR™ mentorship, and every other module in the
              ANCR™ Ecosystem.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
              Ecosystem Modules
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {MODULES.map((m) => (
                <Link
                  key={m.name}
                  to={m.to}
                  data-testid={`footer-mod-${m.name.toLowerCase()}`}
                  className="group flex items-baseline gap-1 font-display font-bold text-sm text-white/70 hover:text-white btn-cine"
                >
                  <span>{m.name}</span>
                  <span
                    className="text-[9px] group-hover:opacity-100 opacity-60"
                    style={{ color: "#F97316" }}
                  >
                    ™
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
              Status
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <StatusRow label="ANCRID Auth" ok />
              <StatusRow label="AIAH · Claude 4.5" ok />
              <StatusRow label="Global Discovery" ok />
              <StatusRow label="ANCRMEDIA Sync" ok />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            © 2026 ANCR™ · CCDP · All rights reserved. Verified invitation-only network.
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Verification Policy</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#F97316", boxShadow: "0 0 8px #F97316" }} />
              v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StatusRow({ label, ok }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span className="flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: ok ? "#22c55e" : "#f97316",
            boxShadow: `0 0 8px ${ok ? "#22c55e" : "#f97316"}`,
          }}
        />
        <span className="text-white/50">{ok ? "OK" : "DEGRADED"}</span>
      </span>
    </div>
  );
}
