import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

// Editorial hero collage — actual ANCRMEDIA content types
const HERO_TILES = [
  { src: "https://images.unsplash.com/photo-1633933757597-2d09c360c2ad?auto=format&fit=crop&w=900&q=80", label: "Recording Session", experience: "ANCRWAV" },
  { src: "https://images.unsplash.com/photo-1598935888738-cd2dfe1c5f79?auto=format&fit=crop&w=900&q=80", label: "Podcast", experience: "ANCRVIEW" },
  { src: "https://images.unsplash.com/photo-1621993646147-8cde7b9cc031?auto=format&fit=crop&w=900&q=80", label: "Film Shoot", experience: "ANCRVIEW" },
  { src: "https://images.pexels.com/photos/26447525/pexels-photo-26447525.jpeg?auto=compress&cs=tinysrgb&w=900", label: "Live Performance", experience: "LIVE" },
  { src: "https://images.unsplash.com/photo-1574892591041-905fbbd00515?auto=format&fit=crop&w=900&q=80", label: "Creator Livestream", experience: "LIVE" },
  { src: "https://images.unsplash.com/photo-1499415479124-43c32433a620?auto=format&fit=crop&w=900&q=80", label: "Masterclass", experience: "ANCRVIEW" },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      nav(loc.state?.from || "/");
    } catch (e2) {
      const d = e2?.response?.data?.detail;
      setErr(typeof d === "string" ? d : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div
      className="min-h-screen bg-[#0B0B0D] text-white grid lg:grid-cols-[1.15fr_1fr]"
      data-testid="login-page"
    >
      {/* ============ LEFT: EDITORIAL HERO ============ */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* Bento collage */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5">
          {HERO_TILES.map((t, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl ${
                i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-1 row-span-2" : ""
              }`}
            >
              <img src={t.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/25 hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span className="text-[9px] tracking-[0.22em] uppercase text-white/85 bg-black/60 backdrop-blur px-2 py-0.5 rounded-md">
                  {t.label}
                </span>
                <span
                  className="text-[8px] tracking-[0.22em] uppercase font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background:
                      t.experience === "ANCRWAV"
                        ? "linear-gradient(135deg, #0052FF, #7000FF)"
                        : t.experience === "LIVE"
                        ? "#FF3B3B"
                        : "linear-gradient(135deg, #FF8A00, #FF3B77)",
                    color: "#fff",
                  }}
                >
                  {t.experience}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Dark cinematic scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,11,13,0.35) 0%, rgba(11,11,13,0.55) 45%, rgba(11,11,13,0.92) 100%)",
          }}
        />
        <div className="absolute inset-0 grain opacity-70 pointer-events-none" />
        {/* Ambient wash */}
        <div className="ambient-flow opacity-40 pointer-events-none" />

        {/* Foreground content — centered editorial lockup */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-14 py-16">
          <div className="flex items-center gap-2.5 text-[10px] tracking-[0.32em] uppercase text-white/60 mb-8" data-testid="hero-powered-by">
            <img src={BRAND.ANCR} alt="ANCR" className="h-3 w-auto object-contain opacity-85" />
            <span>Powered by the ANCR Ecosystem</span>
          </div>

          <img
            src={BRAND.ANCRMEDIA}
            alt="ANCRMEDIA™"
            data-testid="login-ancrmedia-hero"
            className="h-40 xl:h-52 w-auto object-contain drop-shadow-[0_30px_80px_rgba(112,0,255,0.45)]"
          />

          <div className="text-[12px] xl:text-[13px] tracking-[0.28em] uppercase text-white/70 mt-6 max-w-md">
            The Global Creative Network of CCDP™
          </div>

          <div className="mt-14 font-display font-black text-white leading-[0.95] tracking-tighter text-5xl xl:text-6xl">
            <div>Create.</div>
            <div>Share.</div>
            <div>Discover.</div>
            <div className="gradient-text">Belong.</div>
          </div>

          <div className="mt-8 text-[13px] text-white/55 max-w-md font-sans-alt leading-relaxed">
            One global network. Every creator. Every story. One community —
            streaming live across every partner institution in the Contemporary
            Creative Development Program.
          </div>
        </div>
      </div>

      {/* ============ RIGHT: SIGN-IN ============ */}
      <div className="relative flex items-center justify-center p-8 lg:p-14 overflow-hidden">
        {/* Subtle ambient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px 400px at 20% 20%, rgba(0,82,255,0.08), transparent 70%)," +
              "radial-gradient(500px 380px at 90% 90%, rgba(255,90,50,0.06), transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-md">
          {/* Mobile brand stack */}
          <div className="lg:hidden mb-8">
            <img src={BRAND.ANCRMEDIA} alt="ANCRMEDIA™" className="h-16 w-auto object-contain" />
          </div>

          {/* Large ANCRMEDIA lockup on desktop right column */}
          <div className="hidden lg:block mb-8">
            <img src={BRAND.ANCRMEDIA} alt="ANCRMEDIA™" className="h-16 w-auto object-contain" data-testid="login-ancrmedia-form-logo" />
          </div>

          <h1 className="font-display text-3xl xl:text-[38px] font-medium tracking-tight leading-[1.05]">
            Welcome to <span className="gradient-text">ANCRMEDIA™</span>
          </h1>
          <p className="text-[14px] text-white/55 mt-3 font-sans-alt leading-relaxed max-w-sm">
            The global creative network for the Contemporary Creative Development
            Program. Sign in securely with your ANCRID™.
          </p>

          {/* ANCRID identity assurance strip */}
          <div
            className="mt-6 flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]"
            data-testid="ancrid-assurance"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0052FF, #7000FF)" }}
            >
              <ShieldCheck size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-display leading-tight">
                Verified via ANCRID™
              </div>
              <div className="text-[10.5px] text-white/50 leading-tight mt-0.5">
                Identity · Permissions · Institution · Creative Passport
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="login-form">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-white/45">
                ANCRID Email
              </label>
              <input
                data-testid="login-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/[0.03] focus:bg-white/[0.05] focus:border-white/25 border border-white/[0.08] text-sm transition-colors"
                placeholder="you@ancrid.network"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-white/45">
                Password
              </label>
              <input
                data-testid="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/[0.03] focus:bg-white/[0.05] focus:border-white/25 border border-white/[0.08] text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
            {err && (
              <div className="text-[12px] text-red-400" data-testid="login-error">
                {err}
              </div>
            )}
            <button
              data-testid="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-sans-alt font-medium text-[13.5px] hover:brightness-110 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #0052FF 0%, #7000FF 55%, #FF3B77 100%)",
                boxShadow: "0 12px 30px -12px rgba(112,0,255,0.55)",
              }}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} strokeWidth={1.8} />
              )}
              Continue with ANCRID™
              <ChevronRight size={14} strokeWidth={2} className="opacity-80" />
            </button>
            <div className="text-[11px] text-white/40 text-center pt-1">
              By continuing you accept ANCRID authentication. ANCRMEDIA does not
              store passwords.
            </div>
          </form>

          <div className="mt-6 text-[11px] text-white/45 text-center font-sans-alt">
            First time here?{" "}
            <Link
              to="/register"
              data-testid="login-to-register"
              className="text-white hover:underline"
            >
              Provision an ANCRID account
            </Link>
          </div>

          {/* Demo accounts panel */}
          <div
            className="mt-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            data-testid="login-demo-accounts"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/45">
                ANCRID Demo Passports
              </div>
              <div className="text-[9px] text-white/30 tracking-wide uppercase">One-tap</div>
            </div>
            <div className="space-y-1 text-[12px] font-sans-alt">
              <DemoRow
                testid="demo-maya"
                onClick={() => fillDemo("maya@ancrmedia.com", "Creator2026!")}
                label="Maya Okafor"
                sub="Berklee · Student"
              />
              <DemoRow
                testid="demo-kenji"
                onClick={() => fillDemo("kenji@ancrmedia.com", "Creator2026!")}
                label="Kenji Aoki"
                sub="Toho Gakuen Tokyo · Producer"
              />
              <DemoRow
                testid="demo-hayes"
                onClick={() => fillDemo("prof.hayes@ancrmedia.com", "Faculty2026!")}
                label="Prof. Amelia Hayes"
                sub="Berklee · Faculty"
              />
              <DemoRow
                testid="demo-admin"
                onClick={() => fillDemo("admin@ancrmedia.com", "AdminPass2026!")}
                label="ANCR Admin"
                sub="Ecosystem Administrator"
              />
            </div>
          </div>

          {/* Footer hierarchy — endorsement only */}
          <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/40" data-testid="form-ancr-footer">
              Powered by the ANCR Ecosystem
            </div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/35">
              © 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoRow({ testid, onClick, label, sub }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/[0.05] flex items-center justify-between group transition-colors"
    >
      <div>
        <div className="text-white/90 leading-tight">{label}</div>
        <div className="text-[10.5px] text-white/40 leading-tight mt-0.5">{sub}</div>
      </div>
      <ChevronRight size={12} className="text-white/30 group-hover:text-white/70 transition-colors" />
    </button>
  );
}
