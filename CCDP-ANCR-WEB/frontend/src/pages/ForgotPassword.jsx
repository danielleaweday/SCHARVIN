import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { storeApi } from "../lib/storeApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await storeApi.post("/auth/forgot", { email, origin_url: window.location.origin });
      setSent(true);
    } catch {
      setSent(true); // never leak account existence
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none";

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Reset Password" description="Reset your CCDP powered by ANCR store password." noindex />
      <Navbar />
      <section className="flex min-h-[75vh] items-center justify-center pt-[128px]">
        <div className="mx-auto w-full max-w-md px-5 pb-16">
          <div className="rounded-3xl border border-white/10 bg-ccdp-charcoal/40 p-8">
            {sent ? (
              <div data-testid="forgot-sent" className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ccdp-gradient text-white"><MailCheck className="h-7 w-7" /></span>
                <h1 className="mt-5 font-display text-2xl font-semibold text-ccdp-white">Check your email.</h1>
                <p className="mt-3 text-sm text-ccdp-cream/65">If an account exists for {email}, we've sent a link to reset your password. The link expires in 60 minutes.</p>
                <Link to="/store/login" className="mt-6 inline-block text-sm text-gradient">Back to sign in →</Link>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-semibold text-ccdp-white">Forgot your password?</h1>
                <p className="mt-2 text-sm text-ccdp-cream/60">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={submit} className="mt-6 space-y-3">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" data-testid="forgot-email" className={input} />
                  <button type="submit" disabled={loading} data-testid="forgot-submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ccdp-gradient py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                  </button>
                </form>
                <Link to="/store/login" className="mt-5 inline-block text-xs text-ccdp-cream/50 hover:text-gradient">← Back to sign in</Link>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
