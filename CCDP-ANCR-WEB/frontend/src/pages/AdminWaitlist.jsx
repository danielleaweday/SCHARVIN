import { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw, Mail, Download } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuth";
import { Seo } from "../components/Seo";
import { Button } from "../components/ui/button";

const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export default function AdminWaitlist() {
  const { user, ready, logout, authApi } = useAdminAuth();
  const [data, setData] = useState({ signups: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authApi.get("/store/admin/waitlist");
      setData(data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      else toast.error("Failed to load waitlist.");
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { if (ready && user) load(); }, [ready, user]); // eslint-disable-line

  if (ready && !user) return <Navigate to="/admin/login" replace />;
  if (!ready) return <div className="grid min-h-screen place-items-center bg-ccdp-black text-ccdp-cream"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const exportCsv = () => {
    const rows = [["Name", "Email", "Joined"], ...data.signups.map((s) => [s.name || "", s.email, s.created_at || ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "ancr-shop-waitlist.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ccdp-black text-ccdp-cream" data-testid="admin-waitlist">
      <Seo title="ANCR Shop Waitlist" noindex />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ccdp-black/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-ccdp-gradient px-3 py-1.5 font-display text-sm font-extrabold text-white">CCDP CRM</span>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/admin/inquiries" className="text-ccdp-cream/60 hover:text-ccdp-white">Inquiries</Link>
              <Link to="/admin/waitlist" className="font-semibold text-ccdp-white">Shop Waitlist</Link>
              <Link to="/admin/orders" className="text-ccdp-cream/60 hover:text-ccdp-white">Orders</Link>
              <Link to="/admin/inventory" className="text-ccdp-cream/60 hover:text-ccdp-white">Inventory</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ccdp-cream/70">{user?.name}</span>
            <Button onClick={logout} variant="ghost" size="sm" className="text-ccdp-cream/70 hover:text-ccdp-white"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 px-5 py-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><Mail className="h-3.5 w-3.5" /> Total signups</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-waitlist-total">{data.total}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCsv} variant="outline" className="border-white/15 bg-transparent text-ccdp-cream"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            <Button onClick={load} variant="outline" className="border-white/15 bg-transparent text-ccdp-cream"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ccdp-cream/45">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-ccdp-cream/50"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : data.signups.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-ccdp-cream/50">No signups yet.</td></tr>
              ) : data.signups.map((s) => (
                <tr key={s.email} data-testid={`waitlist-row-${s.email}`} className="border-b border-white/5">
                  <td className="px-4 py-3 text-ccdp-white">{s.name || "—"}</td>
                  <td className="px-4 py-3 text-ccdp-cream/75">{s.email}</td>
                  <td className="px-4 py-3 text-ccdp-cream/55">{fmt(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
