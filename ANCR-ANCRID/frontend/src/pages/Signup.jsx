import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    professional_name: "",
    email: "",
    password: "",
    role: "Creator",
    institution: "ANCR Academy",
    discipline: "Music",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function up(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register(form);
    setLoading(false);
    if (res.ok) {
      toast.success("Your ANCRID has been issued");
      navigate("/app/overview");
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-white/5 order-2">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1580529352977-df08012d92b0?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-black/60 via-black/40 to-black" />
        <Link to="/" className="relative font-display text-xl tracking-tighter text-white self-end flex items-center gap-3">
          <img src="https://customer-assets.emergentagent.com/job_digital-identity-128/artifacts/yayjbryc_ChatGPT%20Image%20Jul%207%2C%202026%2C%2004_45_47%20PM.png"
               alt="ANCRID" className="w-9 h-9 rounded-lg object-cover" />
          ANCRID<span className="text-white/40 align-super text-xs">™</span>
        </Link>
        <div className="relative">
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40 mb-4">Claim your identity</div>
          <div className="font-display text-4xl xl:text-5xl tracking-tighter text-white leading-tight">
            A verified creator record for <span className="ancr-gradient-text">life.</span>
          </div>
          <p className="mt-6 text-white/60 max-w-md leading-relaxed">
            You will receive your ANCRID number and Creator Passport ID instantly. They travel with you across every
            application in the ecosystem.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 md:px-12 py-16 order-1">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display text-xl tracking-tighter text-white">
              ANCRID<span className="text-white/40 align-super text-xs">™</span>
            </Link>
          </div>
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-white/40">Create identity</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tighter text-white mt-2">
            Claim your <span className="ancr-gradient-text">ANCRID</span>
          </h1>
          <p className="text-white/50 mt-3 text-sm">One identity. Every ANCR experience. Forever.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-4" data-testid="signup-form">
            <Field label="Professional Name" testid="signup-name">
              <input required value={form.professional_name} onChange={up("professional_name")}
                     className="ancr-input" placeholder="Your creator name" data-testid="signup-name-input" />
            </Field>
            <Field label="Email" testid="signup-email">
              <input required type="email" value={form.email} onChange={up("email")}
                     className="ancr-input" placeholder="you@studio.com" data-testid="signup-email-input" />
            </Field>
            <Field label="Password" testid="signup-password">
              <input required type="password" minLength={6} value={form.password} onChange={up("password")}
                     className="ancr-input" placeholder="At least 6 characters" data-testid="signup-password-input" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Discipline" testid="signup-discipline">
                <select value={form.discipline} onChange={up("discipline")} className="ancr-input" data-testid="signup-discipline-input">
                  {["Music", "Film", "Photography", "Writing", "Design", "Animation", "Multi-Disciplinary"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Role" testid="signup-role">
                <select value={form.role} onChange={up("role")} className="ancr-input" data-testid="signup-role-input">
                  {["Creator", "Student", "Faculty", "Mentor", "Alumnus", "Employer"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Institution" testid="signup-institution">
              <input value={form.institution} onChange={up("institution")} className="ancr-input" placeholder="ANCR Academy" data-testid="signup-institution-input" />
            </Field>

            {error && (
              <div data-testid="signup-error" className="text-sm text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="signup-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:opacity-60 text-black font-medium rounded-2xl px-5 py-4 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Issuing ANCRID…" : "Issue my ANCRID"}
            </button>
          </form>

          <div className="mt-8 text-sm text-white/50">
            Already have one?{" "}
            <Link to="/login" data-testid="link-login" className="text-white hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .ancr-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 1rem;
          padding: 0.9rem 1.1rem;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }
        .ancr-input:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        .ancr-input option { background: #0a0a0a; color: #fff; }
      `}</style>
    </div>
  );
}

function Field({ label, children, testid }) {
  return (
    <label className="block" data-testid={testid}>
      <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-2">{label}</div>
      {children}
    </label>
  );
}
