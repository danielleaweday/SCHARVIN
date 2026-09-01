import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("aaron@ancr.io");
  const [password, setPassword] = useState("ancrid2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back to ANCRID");
      navigate("/app/overview");
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1580529352988-5236c86b9439?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black" />
        <Link to="/" className="relative font-display text-xl tracking-tighter text-white flex items-center gap-3">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-9 h-9 rounded-lg object-cover" />
          ANCRID<span className="text-white/40 align-super text-xs">™</span>
        </Link>
        <div className="relative">
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40 mb-4">The identity layer</div>
          <div className="font-display text-4xl xl:text-5xl tracking-tighter text-white leading-tight">
            One Identity. <span className="ancr-gradient-text">Every Experience.</span>
          </div>
          <p className="mt-6 text-white/60 max-w-md leading-relaxed">
            Sign in to open your ANCRID and every ANCR room connected to it — ANCRLAB, ANCRSync, INHEIRA, Vaulta, Passport,
            ANCRLaunch.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 md:px-12 py-16">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display text-xl tracking-tighter text-white">
              ANCRID<span className="text-white/40 align-super text-xs">™</span>
            </Link>
          </div>
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">Sign in</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-2">
            Open your <span className="ancr-gradient-text">ANCRID</span>
          </h1>
          <p className="text-white/50 mt-3 text-sm">Verified creators sign in with the same identity across every ANCR module.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5" data-testid="login-form">
            <label className="block">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Email</div>
              <input
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-white/40 focus:bg-white/[0.05] outline-none rounded-2xl px-5 py-4 text-white placeholder-white/30 transition-colors"
                placeholder="you@studio.com"
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">Password</div>
              </div>
              <input
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-white/40 focus:bg-white/[0.05] outline-none rounded-2xl px-5 py-4 text-white placeholder-white/30 transition-colors"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <div data-testid="login-error" className="text-sm text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:opacity-60 text-black font-medium rounded-2xl px-5 py-4 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Opening…" : "Enter ANCRID"}
            </button>
          </form>

          <div className="mt-8 text-sm text-white/50">
            New here?{" "}
            <Link to="/signup" data-testid="link-signup" className="text-white hover:underline">
              Claim your ANCRID
            </Link>
          </div>

          <div className="mt-10 glass rounded-2xl p-4">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">Demo Creator</div>
            <div className="font-mono text-xs text-white/80">aaron@ancr.io</div>
            <div className="font-mono text-xs text-white/60">ancrid2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
