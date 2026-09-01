import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

const DISCIPLINES = ["Songwriter", "Producer", "Vocalist", "Guitarist", "Drummer", "Filmmaker", "Podcaster", "DJ", "Beatmaker", "Composer", "Cinematographer", "Multi-Instrumentalist"];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "", institution_id: "", discipline: DISCIPLINES[0], role: "student" });
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/institutions").then((r) => setInstitutions(r.data)).catch(() => {});
  }, []);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await register(form);
      nav("/");
    } catch (e2) {
      const d = e2?.response?.data?.detail;
      setErr(typeof d === "string" ? d : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center p-8" data-testid="register-page">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">
          <img src={BRAND.ANCR} alt="ANCR" className="h-4 w-auto object-contain opacity-80" />
          <span>Powered by the ANCR Ecosystem</span>
        </div>
        <Link to="/" className="inline-block mb-6" data-testid="register-ancrmedia-logo">
          <img src={BRAND.ANCRMEDIA} alt="ANCRMEDIA™" className="h-14 w-auto object-contain" />
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">Provision your <span className="gradient-text">ANCRID™</span>.</h1>
        <p className="text-sm text-white/50 mt-2 font-sans-alt max-w-lg">One identity across ANCRMEDIA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™ and every future ANCR application.</p>

        <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="register-form">
          <div className="md:col-span-2">
            <label className="text-[11px] tracking-widest uppercase text-white/50">Full name</label>
            <input data-testid="reg-name" required value={form.name} onChange={upd("name")} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-white/[0.08] text-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-white/50">Email</label>
            <input data-testid="reg-email" type="email" required value={form.email} onChange={upd("email")} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-white/[0.08] text-sm" placeholder="you@school.edu" />
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-white/50">Password</label>
            <input data-testid="reg-password" type="password" required minLength={6} value={form.password} onChange={upd("password")} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-white/[0.08] text-sm" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-white/50">Institution</label>
            <select data-testid="reg-institution" value={form.institution_id} onChange={upd("institution_id")} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-white/[0.08] text-sm">
              <option value="">Independent / None</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id} className="bg-[#0A0A0A]">{i.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-white/50">Primary Discipline</label>
            <select data-testid="reg-discipline" value={form.discipline} onChange={upd("discipline")} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-white/[0.08] text-sm">
              {DISCIPLINES.map((d) => <option key={d} value={d} className="bg-[#0A0A0A]">{d}</option>)}
            </select>
          </div>
          {err && <div className="md:col-span-2 text-[12px] text-red-400" data-testid="register-error">{err}</div>}
          <div className="md:col-span-2 flex items-center gap-4 mt-4">
            <button data-testid="register-submit" type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-white font-sans-alt font-medium text-sm flex items-center gap-2 hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg, #0052FF 0%, #7000FF 55%, #FF3B77 100%)", boxShadow: "0 12px 30px -12px rgba(112,0,255,0.55)" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} strokeWidth={1.8} />}
              Provision ANCRID
            </button>
            <Link to="/login" data-testid="reg-to-login" className="text-[12px] text-white/60 hover:text-white">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
