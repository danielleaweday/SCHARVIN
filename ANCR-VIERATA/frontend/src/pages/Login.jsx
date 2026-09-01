import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("jaylen@viearta.demo");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await login(email.trim().toLowerCase(), password);
    setBusy(false);
    if (!res.ok) setError(res.error || "Login failed");
    else navigate("/", { replace: true });
  };

  const useDemo = async () => {
    setEmail("jaylen@viearta.demo");
    setPassword("demo123");
    setBusy(true);
    setError("");
    const res = await login("jaylen@viearta.demo", "demo123");
    setBusy(false);
    if (!res.ok) setError(res.error || "Login failed");
    else navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16">
      <AmbientBackground />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 fade-up text-center">
          <Logo variant="full" className="w-full max-w-[320px] h-auto" />
          <div>
            <h1 className="font-display text-3xl sm:text-4xl leading-[1.1] tracking-tight">
              Welcome back
            </h1>
            <p className="text-white/60 mt-2 font-sans text-sm max-w-sm mx-auto">
              Sign in with your CCDP identity to continue caring for your voice, body and craft.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8 fade-up" data-testid="login-form" style={{ animationDelay: "80ms" }}>
          <label className="block text-xs uppercase tracking-[0.22em] text-white/50 mb-2">Email</label>
          <input
            data-testid="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-white/15 focus:border-white/50 outline-none py-3 text-white text-lg font-sans transition-colors"
            placeholder="you@ccdp.studio"
            required
          />

          <label className="block text-xs uppercase tracking-[0.22em] text-white/50 mt-6 mb-2">Password</label>
          <input
            data-testid="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/15 focus:border-white/50 outline-none py-3 text-white text-lg font-sans transition-colors"
            placeholder="Enter your password"
            required
          />

          {error && (
            <div data-testid="login-error" className="mt-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="login-submit"
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-sans text-sm tracking-wide bg-white text-black hover:bg-white/90 disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </button>

          <div className="my-6 flex items-center gap-3 text-white/30 text-xs uppercase tracking-[0.22em]">
            <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={useDemo}
            disabled={busy}
            data-testid="login-demo"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 font-sans text-sm border border-white/15 hover:border-white/30 text-white/80 hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4 text-viearta-teal" />
            Enter as Jaylen Rivers (Demo)
          </button>

          <p className="text-[11px] text-white/40 mt-6 text-center leading-relaxed">
            ANCR single sign-on will be available inside the CCDP experience. <br/>
            For now, use your VIEARTA credentials to continue.
          </p>
        </form>
      </div>
    </div>
  );
}
