import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import CoheirLogo from "@/components/coheir/CoheirLogo";
import AncrBadge from "@/components/coheir/AncrBadge";

const DEMO_ACCOUNTS = [
  { email: "danielle.mcmillan@ccdp.edu", label: "Danielle McMillan", role: "Student" },
  { email: "cam.rivers@coheir.industry", label: "Cam Rivers", role: "Grammy Producer" },
  { email: "vanessa.jones@coheir.industry", label: "Vanessa Jones", role: "A&R Director" },
  { email: "aisha.brooks@ccdp.edu", label: "Dr. Aisha Brooks", role: "Dept. Chair" },
  { email: "admin.president@ccdp.edu", label: "President Halverson", role: "Institution Admin" },
  { email: "brand.hire@sonyhorizon.com", label: "Kai Odenkirk", role: "Employer" },
];

export default function Login() {
  const { user, login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("tab") === "register" ? "register" : "login");
  const [email, setEmail] = useState("danielle.mcmillan@ccdp.edu");
  const [password, setPassword] = useState("demo1234");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(params.get("next") || "/dashboard", { replace: true });
  }, [user, navigate, params]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back to COHEIR™");
      } else {
        await register({ email, password, name, role });
        toast.success("Welcome to COHEIR™");
      }
      navigate(params.get("next") || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const runDemo = async (em) => {
    setBusy(true);
    try {
      await demoLogin(em);
      toast.success("Signed in — welcome");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error("Demo login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 border-r border-white/[0.06] relative overflow-hidden">
        <div className="aurora" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <CoheirLogo variant="wordmark" size={40} />
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-400 mb-6">
            The Industry Leadership Network
          </div>
          <CoheirLogo variant="full" className="mb-6" />
          <p className="text-zinc-400 max-w-md leading-relaxed">
            Every user enters COHEIR™ through their verified ANCRID™ — one identity across ANCRA™, ANCRLAB™,
            ANCRSync™, INHEIRA™, Vaulta™, ANCRLaunch™ and beyond.
          </p>
        </motion.div>
        <div className="relative z-10 flex items-center gap-3">
          <AncrBadge variant="pill" />
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">· CCDP</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <BadgeCheck className="w-4 h-4 text-[#00F0FF] verified-dot" />
            <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">
              ANCRID™ Single Sign-On
            </div>
          </div>
          <h2 className="wordmark text-4xl mb-2">{mode === "login" ? "Sign in to COHEIR" : "Create your ANCRID™"}</h2>
          <p className="text-zinc-500 text-sm mb-8">
            {mode === "login" ? "Continue with your ecosystem identity." : "Your identity travels across the entire ANCR ecosystem."}
          </p>

          <button
            data-testid="google-signin-btn"
            onClick={googleSignIn}
            className="w-full btn-outline flex items-center justify-center gap-3 py-3 mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.58v2.97h3.86c2.26-2.09 3.58-5.17 3.58-8.79z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.97c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.32c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.59H1.29A11.99 11.99 0 000 12c0 1.94.46 3.78 1.29 5.41l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.36.61 4.61 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>
            Continue with Google (Emergent SSO)
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/[0.08]" /></div>
            <div className="relative text-center font-mono text-[10px] tracking-widest uppercase text-zinc-500">
              <span className="bg-black px-3">or use email</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <input value={name} onChange={(e) => setName(e.target.value)} required data-testid="register-name-input"
                  placeholder="Full name" className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.2] rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 outline-none" />
                <select value={role} onChange={(e) => setRole(e.target.value)} data-testid="register-role-select"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white outline-none">
                  <option value="student">I'm a Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="mentor">Industry Mentor</option>
                  <option value="producer">Producer</option>
                  <option value="engineer">Engineer</option>
                  <option value="songwriter">Songwriter</option>
                  <option value="employer">Employer</option>
                  <option value="publisher">Publisher</option>
                  <option value="attorney">Entertainment Attorney</option>
                  <option value="institution_admin">Institution Admin</option>
                </select>
              </>
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" data-testid="auth-email-input"
              placeholder="Email" className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.2] rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" data-testid="auth-password-input"
              placeholder="Password" className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.2] rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 outline-none" />
            <button disabled={busy} data-testid="auth-submit-btn" className="btn-primary w-full flex items-center justify-center gap-2">
              {busy ? "…" : (mode === "login" ? "Sign in" : "Create account")} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-sm text-zinc-500 mt-5 text-center">
            {mode === "login" ? "New to COHEIR?" : "Already have an account?"}{" "}
            <button data-testid="auth-mode-toggle" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#00F0FF] hover:underline">
              {mode === "login" ? "Create your ANCRID™" : "Sign in"}
            </button>
          </div>

          {/* Demo accounts */}
          <div className="mt-8 glass-panel p-4">
            <div className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-3">Instant demo — pick a role</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  data-testid={`demo-login-${a.role.toLowerCase().replace(/[^a-z]/g, "-")}`}
                  onClick={() => runDemo(a.email)}
                  className="text-left glass-interactive px-3 py-2.5">
                  <div className="text-white text-xs font-semibold">{a.label}</div>
                  <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">{a.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
