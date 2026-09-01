import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";

const ROLES = [
  "Student",
  "Faculty",
  "Mentor",
  "Artist",
  "Songwriter",
  "Producer",
  "Engineer",
  "Designer",
  "Animator",
  "Filmmaker",
  "Photographer",
  "Creative Director",
];

const DISCIPLINES = [
  "Music",
  "Film",
  "Animation",
  "Photography",
  "Design",
  "Brand",
  "Podcast",
  "Innovation",
  "Multidisciplinary",
];

export default function Signup() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Songwriter",
    discipline: "Music",
    city: "",
    country: "United States",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      nav("/ancrid-verify");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative z-[2] px-4 py-10">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#007AFF]/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-[140px]" />
      </div>
      <form
        onSubmit={submit}
        data-testid="signup-form"
        className="relative glass rounded-3xl p-10 w-full max-w-xl"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="bg-black border border-white/10 rounded-xl px-3 py-2">
            <img
              src="https://customer-assets.emergentagent.com/job_creative-sync-14/artifacts/5qxf1erx_ChatGPT%20Image%20Jul%206%2C%202026%2C%2009_34_29%20PM.png"
              alt="ANCRSync"
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
        <h1 className="font-display text-3xl mb-2 tracking-tight font-medium">
          Create your ANCRID<span className="text-[#007AFF] text-sm align-super">™</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          One verified creator identity — Passport, credits, and history follow you across every ANCR product.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={set("name")}
              data-testid="signup-name-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
              placeholder="Alex Rivers"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              data-testid="signup-email-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
              placeholder="you@studio.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={set("password")}
              data-testid="signup-password-input"
              minLength={6}
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Role
            </label>
            <select
              value={form.role}
              onChange={set("role")}
              data-testid="signup-role-select"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Discipline
            </label>
            <select
              value={form.discipline}
              onChange={set("discipline")}
              data-testid="signup-discipline-select"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
            >
              {DISCIPLINES.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              City
            </label>
            <input
              value={form.city}
              onChange={set("city")}
              data-testid="signup-city-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
              placeholder="Chicago, London, Accra…"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] tracking-overline text-zinc-500 mb-2">
              Country
            </label>
            <input
              value={form.country}
              onChange={set("country")}
              data-testid="signup-country-input"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] outline-none"
              placeholder="Country"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="signup-submit-btn"
          className="mt-8 w-full bg-[#007AFF] hover:bg-blue-500 text-white rounded-full py-3 text-sm font-medium accent-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
          <ArrowRight size={16} />
        </button>
        <div className="mt-6 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="text-zinc-200 hover:text-white">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
