import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { useStore } from "../context/StoreProvider";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function StoreLogin() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, user } = useStore();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/store/account", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      toast.success("Welcome!");
      navigate("/store/account");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none";

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Sign In" description="Sign in to your CCDP powered by ANCR store account." noindex />
      <Navbar />
      <section className="flex min-h-[80vh] items-center justify-center pt-[128px]">
        <div className="mx-auto w-full max-w-md px-5 pb-16">
          <div className="rounded-3xl border border-white/10 bg-ccdp-charcoal/40 p-8">
            <div className="flex gap-2 rounded-full bg-white/5 p-1">
              <button onClick={() => setMode("login")} data-testid="tab-login" className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-ccdp-gradient text-white" : "text-ccdp-cream/60"}`}>Sign In</button>
              <button onClick={() => setMode("register")} data-testid="tab-register" className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-ccdp-gradient text-white" : "text-ccdp-cream/60"}`}>Create Account</button>
            </div>

            <button onClick={loginWithGoogle} data-testid="google-signin-btn" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white py-3 text-sm font-semibold text-gray-800 transition-transform hover:-translate-y-0.5">
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-ccdp-cream/40">
              <span className="h-px flex-1 bg-white/10" /> or {mode === "login" ? "sign in" : "sign up"} with email <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" data-testid="auth-name" className={input} />
              )}
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" data-testid="auth-email" className={input} />
              <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 8 characters)" data-testid="auth-password" className={input} />
              <button type="submit" disabled={loading} data-testid="auth-submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ccdp-gradient py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {mode === "login" && (
              <p className="mt-4 text-center text-xs">
                <Link to="/store/forgot" data-testid="forgot-link" className="text-ccdp-cream/50 hover:text-gradient">Forgot your password?</Link>
              </p>
            )}

            <p className="mt-5 text-center text-xs text-ccdp-cream/45">
              Prefer to check out now? <Link to="/store/cart" className="text-gradient">Continue as guest →</Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
