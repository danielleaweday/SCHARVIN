import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuth";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Seo } from "../components/Seo";

export default function AdminLogin() {
  const { login, user, ready } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to="/admin/inquiries" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back.");
      navigate("/admin/inquiries", { replace: true });
    } catch (err) {
      const d = err?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Login failed. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ccdp-black px-5">
      <Seo title="Admin Sign In" noindex />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ccdp-charcoal p-8" data-testid="admin-login-card">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-ccdp-gradient text-white">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ccdp-white">CCDP CRM</h1>
            <p className="text-xs text-ccdp-cream/50">Institutional Relationship Management</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-ccdp-cream/70">Email</Label>
            <Input data-testid="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-white/5 text-ccdp-cream" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-ccdp-cream/70">Password</Label>
            <Input data-testid="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="border-white/15 bg-white/5 text-ccdp-cream" required />
          </div>
          <Button data-testid="admin-login-btn" type="submit" disabled={busy}
            className="w-full rounded-full bg-ccdp-gradient py-6 font-semibold text-white hover:opacity-90">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
