import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { VaultaLogo, AncrLogo } from "@/components/VaultaLogo";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DEMO_ROLES = [
  ["Artist",       "artist@vaulta.io"],
  ["Student",      "student@vaulta.io"],
  ["Faculty",      "faculty@vaulta.io"],
  ["Manager",      "manager@vaulta.io"],
  ["Accountant",   "accountant@vaulta.io"],
  ["Attorney",     "attorney@vaulta.io"],
  ["Publisher",    "publisher@vaulta.io"],
  ["Institution",  "institution@vaulta.io"],
  ["Administrator","admin@vaulta.io"],
];

const ROLE_OPTIONS = [
  "Student","Faculty","Artist","Manager","Accountant","Attorney","Publisher","Employer","Institution"
];

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("artist@vaulta.io");
  const [password, setPassword] = useState("Vaulta2026!");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Artist");
  const [loading, setLoading] = useState(false);
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = mode === "login"
      ? await login(email, password)
      : await register({ email, password, name, role });
    setLoading(false);
    if (res.ok) {
      toast.success(`Welcome to Vaulta.`);
      navigate(loc.state?.from?.pathname || "/", { replace: true });
    } else {
      toast.error(res.error || "Authentication failed");
    }
  };

  const quickLogin = async (em) => {
    setEmail(em); setPassword("Vaulta2026!");
    setLoading(true);
    const res = await login(em, "Vaulta2026!");
    setLoading(false);
    if (res.ok) navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-white">
      {/* Ambient gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 blur-[120px]"
           style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 blur-[140px]"
           style={{ background: "radial-gradient(circle, #ff5f1f 0%, #8b5cf6 45%, transparent 70%)" }} />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
        {/* Left rail */}
        <div className="hidden lg:flex flex-col justify-between p-12">
          <VaultaLogo size="large" />
          <div className="max-w-lg">
            <div className="eyebrow mb-4">The Financial Operating System</div>
            <h1 className="font-display text-6xl leading-[0.98] tracking-tight text-white">
              Every dollar. <br/>
              Every royalty. <br/>
              <span className="gradient-text">Every decision.</span>
            </h1>
            <p className="mt-6 text-[14px] text-white/55 max-w-md leading-relaxed">
              Vualta™ is the executive command center for creators — from the first day of CCDP through
              an entire professional career. Not a banking app. Not QuickBooks. Not Mint.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                ["$4.2M", "Tracked TVL"],
                ["12", "PROs + Registries"],
                ["10", "Ecosystem Modules"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl text-white">{v}</div>
                  <div className="text-[10px] tracking-[0.22em] uppercase text-white/40 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <AncrLogo />
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px]">
            <div className="lg:hidden mb-8"><VaultaLogo /></div>
            <div className="glass-strong p-8 relative">
              <div className="absolute top-0 left-6 right-6 h-[2px] gradient-bar rounded-full" />
              <div className="eyebrow mb-2">{mode === "login" ? "Sign In" : "Create Account"}</div>
              <h2 className="font-display text-3xl tracking-tight mb-6">
                {mode === "login" ? "Welcome back." : "Enter the terminal."}
              </h2>

              <form onSubmit={submit} className="space-y-4">
                {mode === "register" && (
                  <>
                    <Field label="Full Name">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        data-testid="register-name-input"
                        className="input-vaulta"
                        placeholder="Kai Marlow"
                      />
                    </Field>
                    <Field label="Role">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        data-testid="register-role-select"
                        className="input-vaulta"
                      >
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>
                  </>
                )}
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                    className="input-vaulta"
                    placeholder="you@vaulta.io"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                    className="input-vaulta"
                    placeholder="••••••••"
                  />
                </Field>

                {error && <div className="text-[12px] text-orange-400" data-testid="auth-error">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="auth-submit-btn"
                  className="w-full mt-2 relative group"
                >
                  <div className="gradient-border rounded-xl">
                    <div className="px-5 py-3 rounded-xl bg-[#0a0a0a] hover:bg-[#111] flex items-center justify-center gap-2 text-[13px] font-semibold tracking-wide">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : (mode === "login" ? "Enter Vaulta" : "Create Account")}
                      {!loading && <ArrowRight size={14} />}
                    </div>
                  </div>
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-[12px]">
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-white/55 hover:text-white"
                  data-testid="auth-toggle-mode"
                >
                  {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="mt-6 glass p-5">
                <div className="eyebrow mb-3">Instant Role Preview</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {DEMO_ROLES.map(([r, em]) => (
                    <button
                      key={em}
                      onClick={() => quickLogin(em)}
                      data-testid={`quick-login-${r.toLowerCase()}`}
                      className="text-[11px] py-2 px-2 rounded-md border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] text-white/70 hover:text-white"
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-white/35 tracking-[0.14em]">
                  Password for all demo roles · Vaulta2026!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .input-vaulta {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
        }
        .input-vaulta:focus { border-color: rgba(0,240,255,0.5); background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-semibold mb-1.5">{label}</div>
      {children}
    </label>
  );
}
