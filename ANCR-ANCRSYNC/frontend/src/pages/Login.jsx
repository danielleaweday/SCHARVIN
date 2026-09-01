import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Music2, Layers, Wallet, Rocket, GraduationCap } from "lucide-react";

const SSO_SOURCES = [
  { key: "ancrlab", label: "ANCRLAB™", icon: Music2, color: "#10B981" },
  { key: "inheira", label: "INHEIRA™", icon: Layers, color: "#F59E0B" },
  { key: "vaulta", label: "Vaulta™", icon: Wallet, color: "#22D3EE" },
  { key: "ancrlaunch", label: "ANCRLaunch™", icon: Rocket, color: "#EC4899" },
  { key: "ancra", label: "ANCRA™", icon: GraduationCap, color: "#8B5CF6" },
];

export default function Login() {
  const nav = useNavigate();
  const { login, federated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav("/ancrid-verify");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sso = async (source) => {
    setSsoLoading(source);
    try {
      await federated(source);
      nav("/ancrid-verify");
    } catch (err) {
      toast.error(`Federation with ${source} failed`);
    } finally {
      setSsoLoading("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative z-[2] px-4">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#007AFF]/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-[140px]" />
      </div>
      <form
        onSubmit={submit}
        data-testid="login-form"
        className="relative glass rounded-3xl p-10 w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8"
          data-testid="login-logo"
        >
          <div className="bg-black border border-white/10 rounded-xl px-3 py-2">
            <img
              src="https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/5qxf1erx_ChatGPT%20Image%20Jul%206%2C%202026%2C%2009_34_29%20PM.png"
              alt="ANCRSync"
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
        <h1 className="font-display text-3xl mb-2 tracking-tight font-medium">
          Sign in with ANCRID<span className="text-[#007AFF] text-sm align-super">™</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          One identity across the entire ANCR ecosystem.
        </p>

        <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="login-email-input"
          placeholder="you@studio.com"
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none mb-4"
        />
        <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="login-password-input"
          placeholder="••••••••"
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none mb-6"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit-btn"
          className="w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in with ANCRID"}
          <ArrowRight size={16} />
        </button>

        <div className="flex items-center gap-3 my-6" data-testid="sso-divider">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] tracking-overline text-zinc-500">
            Or continue with your ANCRID from
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-5 gap-2" data-testid="sso-grid">
          {SSO_SOURCES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => sso(s.key)}
              disabled={ssoLoading === s.key}
              data-testid={`sso-${s.key}`}
              title={s.label}
              className="group flex flex-col items-center gap-1 border border-white/[0.06] rounded-xl py-2.5 hover:border-white/[0.16] hover:bg-white/[0.02] transition-all disabled:opacity-50"
            >
              <s.icon
                size={16}
                style={{ color: s.color }}
                strokeWidth={1.6}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-[9px] tracking-overline text-zinc-500 group-hover:text-zinc-300">
                {s.label.replace("™", "")}
              </span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-zinc-600 text-center mt-3">
          One ANCRID unlocks every ANCR product.
        </div>
        <div className="mt-6 text-center text-xs text-zinc-500">
          New here?{" "}
          <Link
            to="/signup"
            className="text-zinc-200 hover:text-white"
            data-testid="goto-signup"
          >
            Create your ANCRID
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-[9px] tracking-overline text-zinc-600 mb-2 text-center">
            Creators online worldwide
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["🇺🇸","🇬🇧","🇬🇭","🇦🇺","🇦🇪","🇨🇦","🇧🇷","🇯🇵","🇩🇪","🇰🇷","🇮🇳","🇫🇷"].map((f, i) => (
              <span key={i} className="text-base leading-none opacity-70 hover:opacity-100 transition-opacity">
                {f}
              </span>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
