import { motion } from "framer-motion";
import { BRAND, ECOSYSTEM_MODULES } from "@/lib/brand";

// Ecosystem sidebar module rail — sourced from shared brand module list.
const MODULES = [
  { key: "home", name: "Ecosystem", short: "◈", hue: "#FFFFFF", href: "#", desc: "ANCR Ecosystem Home" },
  ...ECOSYSTEM_MODULES.map((m) => ({
    key: m.key,
    name: m.name,
    short: m.name === "ANCRMEDIA" ? "M" : (m.name === "Vaulta" ? "V" : m.name.replace("ANCR", "")[0] || m.name[0]),
    hue:
      m.key === "ancra" ? "#0052FF" :
      m.key === "ancrlab" ? "#7000FF" :
      m.key === "ancrsync" ? "#00C2FF" :
      m.key === "coheir" ? "#FF6B00" :
      m.key === "inheira" ? "#FF3B77" :
      m.key === "vaulta" ? "#3EE3B2" :
      m.key === "ancrmedia" ? "gradient" :
      m.key === "ancrlaunch" ? "#FFD166" :
      m.key === "ancrid" ? "#8A8AFF" : "#FFFFFF",
    href: m.href,
    desc: m.tagline,
    active: !!m.active,
  })),
];

export default function EcosystemSidebar() {
  return (
    <aside
      data-testid="ecosystem-sidebar"
      className="fixed left-0 top-0 bottom-0 w-[68px] z-40 border-r border-white/[0.05] bg-[#08080A]/85 backdrop-blur-2xl flex flex-col items-center py-4"
    >
      <a href="#" className="mb-4 flex items-center justify-center w-11 h-11 rounded-xl gradient-progress relative" data-testid="ancr-mark">
        <span className="font-display text-lg font-black text-black">A</span>
      </a>
      <div className="w-8 h-px bg-white/10 mb-4" />
      <div className="flex-1 flex flex-col gap-2 items-center overflow-y-auto py-1">
        {MODULES.map((m) => (
          <a
            key={m.key}
            href={m.href}
            title={`${m.name} — ${m.desc}`}
            data-testid={`eco-${m.key}`}
            className="group relative"
          >
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                  m.active
                    ? "border-white/20 shadow-[0_0_28px_rgba(112,0,255,0.35)]"
                    : "border-white/[0.06] hover:border-white/20"
                } transition-colors`}
                style={{
                  background: m.hue === "gradient"
                    ? "linear-gradient(135deg, #0052FF 0%, #7000FF 55%, #FF6B00 100%)"
                    : "#0F0F13",
                }}
              >
                <span
                  className="font-display text-sm font-bold"
                  style={{
                    color: m.hue === "gradient" ? "#fff" : m.hue,
                    textShadow: m.active ? "0 0 8px rgba(255,255,255,0.5)" : "none",
                  }}
                >
                  {m.short}
                </span>
              </div>
              {m.active && (
                <motion.span
                  layoutId="eco-active"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-progress"
                />
              )}
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <div className="glass-strong px-3 py-2 rounded-lg whitespace-nowrap">
                  <div className="text-[13px] font-display font-medium">{m.name}™</div>
                  <div className="text-[10px] text-white/50 tracking-wide">{m.desc}</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
}
