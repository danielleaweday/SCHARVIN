import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Radio, Layers, Globe2 } from "lucide-react";

const modules = [
  "ANCRA", "ANCRLAB", "ANCRSync", "INHEIRA", "Vaulta", "Passport", "ANCRLaunch", "ANCRVIEW", "ANCRWAV",
];

const pillars = [
  { icon: ShieldCheck, title: "Verified Identity", body: "Government, student, faculty, industry and creator verifications live under one signature." },
  { icon: Layers,      title: "Every Work, Owned", body: "Every song, film, publication, session and residency contributes to your permanent record." },
  { icon: Radio,       title: "One SSO",           body: "Sign in once. Every module in the ANCR ecosystem authenticates through ANCRID." },
  { icon: Globe2,      title: "Global Passport",   body: "Track collaborations, tours, residencies and creative exchanges across borders." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between" data-testid="landing-nav">
        <Link to="/" className="flex items-center gap-3">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <div className="font-display text-xl tracking-tighter text-white leading-none">ANCRID<span className="text-white/40 text-xs align-super">™</span></div>
            <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/40 mt-0.5">Part of the ANCR Ecosystem</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.24em] text-white/50">
          <a href="#pillars" className="hover:text-white transition-colors">Identity</a>
          <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#for-whom" className="hover:text-white transition-colors">For Whom</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            data-testid="nav-login"
            className="hidden sm:inline-flex text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            data-testid="nav-signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-black bg-white px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            Claim your ANCRID
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-14 md:pt-24 pb-20 md:pb-32">
        <div className="fade-up font-mono text-[11px] tracking-[0.32em] uppercase text-white/40 mb-6" data-testid="hero-eyebrow">
          Part of the ANCR Ecosystem · Identity Layer
        </div>
        <h1 className="fade-up-2 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[92px] leading-[0.95] tracking-tighter text-white max-w-5xl">
          One Identity.
          <br />
          <span className="ancr-gradient-text">Every Experience.</span>
        </h1>
        <p className="fade-up-3 mt-8 max-w-2xl text-white/60 text-lg leading-relaxed">
          ANCRID™ is the secure digital identity that powers every application in the ANCR ecosystem. Every song, film,
          session, collaboration, credential, financial milestone and residency follows the creator through one verified,
          lifelong record.
        </p>

        <div className="fade-up-4 mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            data-testid="hero-cta-primary"
            className="group inline-flex items-center gap-2 text-black bg-white hover:bg-white/90 transition-colors font-medium text-sm px-6 py-3.5 rounded-full"
          >
            Claim your ANCRID
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/login"
            data-testid="hero-cta-secondary"
            className="inline-flex items-center gap-2 text-white border border-white/15 hover:border-white/30 hover:bg-white/[0.03] transition-colors text-sm px-6 py-3.5 rounded-full"
          >
            Sign in with existing ANCRID
          </Link>
        </div>

        {/* Passport preview card */}
        <div className="mt-20 md:mt-24 grid lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden ancr-gradient-border" data-testid="hero-passport-card">
            <div className="p-8 md:p-10 bg-[#070707] rounded-3xl">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/40">ANCRID · Creator Passport</div>
                  <div className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-3">Aaron Ellington</div>
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/40 mt-2">Songwriter · Producer · Director</div>
                </div>
                <div className="w-14 h-14 rounded-2xl ancr-gradient-bg" />
              </div>
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">ANCRID №</div>
                  <div className="font-mono text-white text-sm mt-1">ANCRID-2026-0001</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Passport</div>
                  <div className="font-mono text-white text-sm mt-1">CPX-8842-INHR</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Verified</div>
                  <div className="text-white text-sm mt-1">Gov · Student · Creator</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">Since</div>
                  <div className="text-white text-sm mt-1">Sept 2024</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-3xl p-7 md:p-8">
            <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/40">Live Ecosystem Feed</div>
            <div className="mt-4 space-y-3">
              {[
                ["ANCRLAB", "Studio B — Amber Room takes", "2h ago", "dot-pulse"],
                ["INHEIRA", "The Amber Room EP — draft locked", "4d", "dot-pulse violet"],
                ["Vaulta",  "Publishing split registered", "1w",  "dot-pulse orange"],
                ["Passport","Marrakech Residency approved", "3w",  "dot-pulse"],
              ].map(([code, note, when, dot]) => (
                <div key={code} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-b-0">
                  <span className={dot} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{note}</div>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mt-0.5">{code}</div>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.16em] text-white/40 shrink-0">{when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem marquee */}
      <section id="ecosystem" className="border-y border-white/5 py-8 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-6 flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">Connected Ecosystem</div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/40">One key. Every room.</div>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee flex gap-16 whitespace-nowrap font-display text-3xl md:text-5xl text-white/25">
            {[...modules, ...modules].map((m, i) => (
              <span key={i} className="tracking-tighter">{m}<span className="text-white/10">™</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">Not a profile.</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-tighter text-white mt-3">
            A Creator Identity <span className="ancr-gradient-text">Operating System.</span>
          </h2>
          <p className="mt-6 text-white/60 text-lg leading-relaxed">
            LinkedIn is a résumé. ANCRID is a record. Every action inside the ecosystem — a collaboration in ANCRSync,
            a session in ANCRLAB, a release in INHEIRA, a course in ANCRA, a split in Vaulta — writes verified data
            back to your identity. Automatically. Permanently.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-3xl p-7 hover-lift" data-testid={`pillar-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                <Icon size={18} strokeWidth={1.6} className="text-white" />
              </div>
              <div className="font-display text-xl text-white mt-6 tracking-tight">{title}</div>
              <div className="text-white/55 text-sm leading-relaxed mt-3">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For whom */}
      <section id="for-whom" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="glass-strong rounded-3xl p-8 md:p-14">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div>
              <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">One Identity, Every Role</div>
              <h3 className="font-display text-3xl md:text-4xl tracking-tighter text-white mt-3">
                Students. Faculty. Alumni. Employers. Every creator.
              </h3>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-x-10 gap-y-4">
              {[
                ["Students",   "One ID from admission through graduation and beyond."],
                ["Faculty",    "Verify credentials, mentor, and sign off on portfolio work."],
                ["Mentors",    "Contribute verified endorsements and evidence."],
                ["Alumni",     "Your identity keeps writing after graduation."],
                ["Employers",  "Discover verified creators with real, verifiable work."],
                ["Institutions","One identity fabric across every ANCR application."],
              ].map(([who, note]) => (
                <div key={who} className="flex items-start gap-4 py-3 border-b border-white/5">
                  <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/50 w-28 shrink-0 pt-1">{who}</div>
                  <div className="text-white/70 text-sm leading-relaxed">{note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-white/5">
            <div className="font-display text-2xl md:text-3xl tracking-tight text-white max-w-xl">
              Your creative identity — verified, portable, permanent.
            </div>
            <Link
              to="/signup"
              data-testid="footer-cta"
              className="inline-flex items-center gap-2 text-black bg-white hover:bg-white/90 transition-colors font-medium text-sm px-6 py-3.5 rounded-full"
            >
              Claim your ANCRID
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 border-t border-white/5 grid md:grid-cols-3 gap-8 items-center">
        <div className="font-mono tracking-[0.24em] uppercase text-white/40 text-xs">© 2026 ANCR · ANCRID™</div>
        <div className="flex items-center justify-center">
          <img
            src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/0j1q4by9_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png"
            alt="ANCR — Artist Discovery & Development Network"
            className="h-10 opacity-80"
          />
        </div>
        <div className="font-mono tracking-[0.2em] uppercase text-white/40 text-xs md:text-right">Part of the ANCR Ecosystem</div>
      </footer>
    </div>
  );
}
