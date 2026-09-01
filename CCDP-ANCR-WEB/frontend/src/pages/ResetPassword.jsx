import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { storeApi } from "../lib/storeApi";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await storeApi.post("/auth/reset", { email, token, password });
      toast.success("Password updated. Please sign in.");
      navigate("/store/login");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none";

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Set New Password" description="Set a new password for your CCDP powered by ANCR store account." noindex />
      <Navbar />
      <section className="flex min-h-[75vh] items-center justify-center pt-[128px]">
        <div className="mx-auto w-full max-w-md px-5 pb-16">
          <div className="rounded-3xl border border-white/10 bg-ccdp-charcoal/40 p-8">
            <h1 className="font-display text-2xl font-semibold text-ccdp-white">Set a new password.</h1>
            {!token || !email ? (
              <p className="mt-3 text-sm text-ccdp-cream/65">This reset link is missing or invalid. <Link to="/store/forgot" className="text-gradient">Request a new one →</Link></p>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-3">
                <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 characters)" data-testid="reset-password" className={input} />
                <button type="submit" disabled={loading} data-testid="reset-submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ccdp-gradient py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
