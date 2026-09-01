import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function Login() {
  const nav = useNavigate();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("student@ancrlaunch.demo");
  const [password, setPassword] = useState("ancrlaunch2026");
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    if (user) nav("/dashboard");
  }, [user, nav]);

  useEffect(() => {
    api.get("/auth/demo-accounts").then((r) => setDemoAccounts(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black relative z-10">
      {/* Left — brand + demo picker */}
      <div className="relative border-b lg:border-b-0 lg:border-r hair px-8 md:px-16 py-12 lg:py-20 flex flex-col">
        <div className="flex items-center gap-3">
          <Logo size={44} />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl">ANCR</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 pb-1">Launch™</span>
          </div>
        </div>

        <div className="mt-16 lg:mt-24 flex justify-center lg:justify-start">
          <img
            src="/ancrlaunch-logo.png"
            alt=""
            aria-hidden
            className="w-56 md:w-72 h-auto opacity-95 select-none pointer-events-none"
          />
        </div>

        <div className="mt-10 lg:mt-8">
          <div className="label-eyebrow mb-6">The Career Placement Platform of the ANCR™ Ecosystem</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            <span>Learn.</span><br />
            <span>Graduate.</span><br />
            <span className="grad-text">Launch.</span>
          </h1>
          <p className="mt-8 text-white/60 max-w-md leading-relaxed">
            Verified creators from every CCDP institution transition into professional careers here. Portfolios, publishing, reputation, and readiness — assembled from the ecosystem.
          </p>
        </div>

        <div className="mt-16">
          <div className="label-eyebrow mb-4">Sign in as a demo role</div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((d) => (
              <button
                key={d.email}
                data-testid={`demo-account-${d.role}`}
                onClick={() => { setEmail(d.email); setPassword("ancrlaunch2026"); }}
                className="text-left px-4 py-3 border hair hover:border-white/25 hover:bg-white/[0.03] transition-colors"
              >
                <div className="label-eyebrow text-[9px]">{d.role.replace("_", " ")}</div>
                <div className="text-sm mt-1 truncate">{d.full_name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="px-8 md:px-16 py-12 lg:py-20 flex flex-col justify-center">
        <form onSubmit={submit} className="max-w-md w-full">
          <div className="label-eyebrow mb-4">ANCRID™ Sign-In</div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-12">
            One identity.<br />Every module.
          </h2>

          <label className="label-eyebrow block">Email</label>
          <input
            data-testid="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b hair-strong py-3 mt-2 mb-8 focus:outline-none focus:border-[#00f0ff] transition-colors font-body text-base"
          />

          <label className="label-eyebrow block">Password</label>
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-b hair-strong py-3 mt-2 mb-10 focus:outline-none focus:border-[#00f0ff] transition-colors font-body text-base"
          />

          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-mono text-[11px] uppercase tracking-[0.28em] hover:bg-white/90 transition-colors"
          >
            <span>{loading ? "Verifying" : "Enter ANCRLaunch"}</span>
            <ArrowRight strokeWidth={1.5} className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-8 text-xs text-white/40 font-mono uppercase tracking-[0.2em]">
            Demo password: ancrlaunch2026
          </p>
        </form>
      </div>
    </div>
  );
}
