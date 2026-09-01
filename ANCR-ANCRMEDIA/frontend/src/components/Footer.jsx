import { BRAND, ECOSYSTEM_MODULES } from "@/lib/brand";

export default function Footer() {
  return (
    <footer data-testid="ancr-footer" className="mt-16 border-t border-white/[0.06] bg-[#08080A]">
      {/* ANCR Ecosystem strip */}
      <div className="px-8 py-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_2fr] gap-10">
          {/* Brand */}
          <div>
            <img
              src={BRAND.ANCR}
              alt="ANCR"
              className="h-14 w-auto object-contain object-left"
              data-testid="footer-ancr-logo"
            />
            <div className="mt-6 text-[11px] tracking-[0.22em] uppercase text-white/45">
              Part of the ANCR Ecosystem
            </div>
            <p className="mt-3 text-[13px] text-white/55 font-sans-alt leading-relaxed max-w-sm">
              ANCRMEDIA™ is the global media and discovery network of the ANCR Ecosystem, powering
              the Contemporary Creative Development Program (CCDP™) across every partner institution
              in the world.
            </p>
          </div>

          {/* Modules grid */}
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">
              The Ecosystem
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {ECOSYSTEM_MODULES.map((m) => (
                <a
                  key={m.key}
                  href={m.href}
                  data-testid={`footer-module-${m.key}`}
                  className={`group flex flex-col ${m.active ? "text-white" : "text-white/70 hover:text-white"} transition-colors`}
                >
                  <span className="font-display text-[15px] tracking-tight flex items-center gap-2">
                    {m.name}<span className="text-white/30 text-[10px] align-top">™</span>
                    {m.active && (
                      <span className="ml-1 text-[8px] tracking-[0.22em] uppercase text-[#0052FF]">
                        · You're here
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-white/40">{m.tagline}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-[10px] tracking-[0.24em] uppercase text-white/40">
              ANCRMEDIA™ · v1.0
            </div>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-3">
              <img src={BRAND.ANCRWAV} alt="ANCRWAV" className="h-4 w-auto object-contain opacity-70" data-testid="footer-ancrwav-mark" />
              <img src={BRAND.ANCRVIEW} alt="ANCRVIEW" className="h-4 w-auto object-contain opacity-70" data-testid="footer-ancrview-mark" />
            </div>
          </div>
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/35">
            © 2026 ANCR Holdings · Powered by ANCRID™
          </div>
        </div>
      </div>
    </footer>
  );
}
