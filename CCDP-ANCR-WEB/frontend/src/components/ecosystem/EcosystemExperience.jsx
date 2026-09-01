import { useState } from "react";
import * as Icons from "lucide-react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { PLATFORMS, BRANCHES, PLATFORM_PREVIEWS } from "../../lib/content";
import { PlatformMock } from "./PlatformMock";

const EASE = [0.22, 1, 0.36, 1];

export const EcosystemExperience = () => {
  const ancr = PLATFORMS.find((p) => p.os);
  const coreModules = PLATFORMS.filter((p) => !p.os);
  const modules = [...coreModules, ancr];
  const [selectedId, setSelectedId] = useState("ancr");
  const [filter, setFilter] = useState("all");
  const selected = PLATFORMS.find((p) => p.id === selectedId) || ancr;
  const SelIcon = Icons[selected.icon] || Icons.Boxes;

  const dim = (branch) => filter !== "all" && filter !== branch;

  return (
    <div data-testid="ecosystem-experience">
      {/* Architecture header: CCDP -> Education / Technology / Careers */}
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-ccdp-gradient px-6 py-2.5 font-display text-lg font-extrabold tracking-tight text-white shadow-lg shadow-ccdp-purple/25">
          CCDP
        </div>
        <div className="h-8 w-px bg-white/15" />
        <div className="grid w-full max-w-3xl grid-cols-3 gap-3">
          {BRANCHES.map((b) => {
            const active = filter === b.id;
            const count = coreModules.filter((p) => p.branch === b.id).length;
            return (
              <button
                key={b.id}
                data-testid={`branch-${b.id}`}
                onClick={() => setFilter(active ? "all" : b.id)}
                className={`group relative rounded-2xl border p-4 text-center transition-all duration-300 ${
                  active ? "border-transparent bg-white/[0.06]" : "border-white/10 hover:border-white/25"
                }`}
                style={active ? { boxShadow: `0 0 0 1px ${b.color}55, 0 10px 40px -12px ${b.color}66` } : {}}
              >
                <span className="mx-auto mb-2 block h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                <span className="block font-display text-sm font-semibold tracking-tight text-ccdp-white">{b.label}</span>
                <span className="mt-0.5 block text-[11px] text-ccdp-cream/45">{count} platforms</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core: nodes + detail */}
      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        {/* Nodes */}
        <div className="lg:col-span-7">
          {/* ANCR OS hub */}
          <button
            data-testid="node-ancr"
            onMouseEnter={() => setSelectedId("ancr")}
            onClick={() => setSelectedId("ancr")}
            className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
              selectedId === "ancr" ? "border-transparent bg-white/[0.06]" : "border-white/10 hover:border-white/25"
            }`}
            style={selectedId === "ancr" ? { boxShadow: "0 0 0 1px rgba(122,63,242,.5), 0 20px 60px -20px rgba(122,63,242,.5)" } : {}}
          >
            <div className="flex items-center gap-4">
              <img src={ancr.logo} alt="ANCR" className="h-11 w-auto shrink-0 object-contain" draggable="false" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ccdp-cream/70">Operating System</span>
                </div>
                <p className="mt-1 text-sm text-ccdp-cream/55">Powers and connects every platform below.</p>
              </div>
            </div>
          </button>

          <div className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/35">
            <span className="h-px flex-1 bg-white/10" /> Unifies {coreModules.length} platforms <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {modules.map((p) => {
              const Icon = Icons[p.icon] || Icons.Boxes;
              const active = selectedId === p.id;
              return (
                <motion.button
                  key={p.id}
                  data-testid={`node-${p.id}`}
                  onMouseEnter={() => setSelectedId(p.id)}
                  onClick={() => setSelectedId(p.id)}
                  animate={{ opacity: dim(p.branch) ? 0.32 : 1 }}
                  whileHover={{ y: -3 }}
                  className={`relative rounded-2xl border p-4 text-left transition-colors duration-300 ${
                    active ? "border-transparent bg-white/[0.07]" : "border-white/10 hover:border-white/25"
                  }`}
                  style={active ? { boxShadow: `0 0 0 1px ${p.accent}77, 0 14px 44px -16px ${p.accent}99` } : {}}
                >
                  <div className="flex items-center justify-between">
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} draggable="false"
                        className="h-8 max-w-[72%] object-contain object-left" />
                    ) : (
                      <span className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${active ? "bg-ccdp-gradient text-white" : "bg-white/5 text-ccdp-cream"}`}>
                        <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                      </span>
                    )}
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.accent }} />
                  </div>
                  <div className="mt-3 font-display text-sm font-semibold tracking-tight text-ccdp-white">{p.name}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-ccdp-cream/45">{p.comingSoon ? "Coming soon" : p.tagline}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-ccdp-charcoal/60"
                data-testid="ecosystem-detail"
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-ccdp-black">
                  {PLATFORM_PREVIEWS[selected.id] ? (
                    <img src={PLATFORM_PREVIEWS[selected.id]} alt={`${selected.name} product preview`} className="h-full w-full object-cover" />
                  ) : (
                    <PlatformMock platform={selected} />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ccdp-charcoal/55 via-transparent to-transparent" />
                  {selected.comingSoon && (
                    <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ccdp-cream/75 backdrop-blur">Coming Soon</span>
                  )}
                  <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ccdp-cream glass">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: selected.accent }} />
                    {BRANCHES.find((b) => b.id === selected.branch)?.label}
                  </span>
                </div>
                <div className="p-6 md:p-7">
                  {selected.logo ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-xl p-2.5" style={{ background: selected.logoBg || "#000000" }}>
                        <img src={selected.logo} alt={selected.name} className="max-h-full max-w-full object-contain" draggable="false" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gradient">{selected.tagline}</p>
                      <h3 className="sr-only">{selected.name}</h3>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: selected.accent }}>
                        <SelIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-bold tracking-tight text-ccdp-white">{selected.name}</h3>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gradient">{selected.tagline}</p>
                      </div>
                    </div>
                  )}
                  <p className="mt-5 text-sm leading-relaxed text-ccdp-cream/70">{selected.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {(selected.benefits || []).map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ccdp-cream/80">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ccdp-gradient text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
