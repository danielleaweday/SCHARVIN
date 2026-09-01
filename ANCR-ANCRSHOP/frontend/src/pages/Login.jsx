import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate(location.state?.from || "/account");
    else setError(res.error);
  };

  return (
    <div className="grid min-h-[calc(100vh-120px)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <PlaceholderMedia icon="ShoppingBag" accent="a" className="h-full w-full" iconClassName="!size-56" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#050505] to-transparent p-14">
          <div>
            <h2 className="font-display text-5xl font-medium leading-tight">
              Welcome back to the <span className="text-ccdp-gradient italic">ecosystem</span>.
            </h2>
            <p className="mt-4 max-w-md font-body text-white/60">
              One account across ANCRSHOP™, CCDP™ and every ANCR application.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-4xl font-medium">Sign in</h1>
          <p className="mt-2 font-body text-sm text-white/50">Access your orders, wishlist and rewards.</p>
          {error && (
            <p className="mt-5 rounded-lg border border-[#ff2bd0]/30 bg-[#ff2bd0]/10 px-4 py-3 font-body text-sm text-[#ff9edb]" data-testid="login-error">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              data-testid="login-email"
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              data-testid="login-password"
              className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-3.5 font-head text-sm font-semibold text-white hover:bg-[#0836cc] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
          </button>
          <p className="mt-5 text-center font-body text-sm text-white/50">
            New here?{" "}
            <Link to="/register" className="text-white underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center font-body text-xs text-white/30">
            Demo: creator@ancrshop.com / creator123
          </p>
        </motion.form>
      </div>
    </div>
  );
}
