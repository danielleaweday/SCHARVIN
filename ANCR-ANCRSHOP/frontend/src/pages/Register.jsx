import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { useAuth } from "@/context/AuthContext";

const ROLES = [
  ["customer", "Customer"],
  ["student", "Student"],
  ["creator", "Creator"],
  ["artist", "Artist"],
  ["faculty", "Faculty"],
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.ok) navigate("/account");
    else setError(res.error);
  };

  return (
    <div className="grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-16 lg:order-1">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-4xl font-medium">Create account</h1>
          <p className="mt-2 font-body text-sm text-white/50">Join the ANCR creator ecosystem.</p>
          {error && (
            <p className="mt-5 rounded-lg border border-[#ff2bd0]/30 bg-[#ff2bd0]/10 px-4 py-3 font-body text-sm text-[#ff9edb]" data-testid="register-error">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              required
              data-testid="register-name"
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
              data-testid="register-email"
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              required
              minLength={6}
              data-testid="register-password"
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              data-testid="register-role"
              className="w-full rounded-xl border border-white/15 bg-[#0a0a0a] px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            >
              {ROLES.map(([v, l]) => (
                <option key={v} value={v}>
                  I'm a {l}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-3.5 font-head text-sm font-semibold text-white hover:bg-[#0836cc] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
          </button>
          <p className="mt-5 text-center font-body text-sm text-white/50">
            Already have an account?{" "}
            <Link to="/login" className="text-white underline">
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>
      <div className="relative hidden lg:block">
        <PlaceholderMedia icon="Sparkles" accent="c" className="h-full w-full" iconClassName="!size-56" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#050505] to-transparent p-14">
          <h2 className="font-display text-5xl font-medium leading-tight">
            Learn. Create. <span className="text-ccdp-gradient italic">Earn.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
