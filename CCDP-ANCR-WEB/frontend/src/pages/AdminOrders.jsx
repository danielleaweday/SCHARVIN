import { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw, Package, DollarSign, ShoppingBag } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuth";
import { Seo } from "../components/Seo";
import { money } from "../lib/storeApi";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

const FULFILLMENT = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"];
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export default function AdminOrders() {
  const { user, ready, logout, authApi } = useAdminAuth();
  const [data, setData] = useState({ orders: [], total: 0, paidCount: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authApi.get("/store/admin/orders");
      setData(data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      else toast.error("Failed to load orders.");
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { if (ready && user) load(); }, [ready, user]); // eslint-disable-line

  if (ready && !user) return <Navigate to="/admin/login" replace />;
  if (!ready) return <div className="grid min-h-screen place-items-center bg-ccdp-black text-ccdp-cream"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const setFulfillment = async (orderId, status, tracking) => {
    try {
      const body = { fulfillment_status: status };
      if (tracking !== undefined) body.tracking_number = tracking;
      const { data: updated } = await authApi.patch(`/store/admin/orders/${orderId}`, body);
      setData((d) => ({ ...d, orders: d.orders.map((o) => (o.order_id === orderId ? updated : o)) }));
      toast.success("Order updated.");
    } catch { toast.error("Update failed."); }
  };

  return (
    <div className="min-h-screen bg-ccdp-black text-ccdp-cream" data-testid="admin-orders">
      <Seo title="Store Orders" noindex />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ccdp-black/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-ccdp-gradient px-3 py-1.5 font-display text-sm font-extrabold text-white">CCDP CRM</span>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/admin/inquiries" className="text-ccdp-cream/60 hover:text-ccdp-white">Inquiries</Link>
              <Link to="/admin/waitlist" className="text-ccdp-cream/60 hover:text-ccdp-white">Shop Waitlist</Link>
              <Link to="/admin/orders" className="font-semibold text-ccdp-white">Orders</Link>
              <Link to="/admin/inventory" className="text-ccdp-cream/60 hover:text-ccdp-white">Inventory</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ccdp-cream/70">{user?.name}</span>
            <Button data-testid="admin-logout-btn" onClick={logout} variant="ghost" size="sm" className="text-ccdp-cream/70 hover:text-ccdp-white"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><ShoppingBag className="h-3.5 w-3.5" /> Total orders</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-total-orders">{data.total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><Package className="h-3.5 w-3.5" /> Paid orders</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-paid-orders">{data.paidCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><DollarSign className="h-3.5 w-3.5" /> Revenue</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-revenue">{money(data.revenue)}</p>
          </div>
          <div className="flex items-center justify-end rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <Button onClick={load} variant="outline" className="border-white/15 bg-transparent text-ccdp-cream"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ccdp-cream/45">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-ccdp-cream/50"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : data.orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-ccdp-cream/50">No orders yet.</td></tr>
              ) : data.orders.map((o) => (
                <tr key={o.order_id} data-testid={`order-row-${o.order_id}`} className="border-b border-white/5">
                  <td className="px-4 py-3 text-ccdp-cream/60">{fmt(o.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ccdp-cream/70">{o.order_id}</td>
                  <td className="px-4 py-3">{o.email || "—"}</td>
                  <td className="px-4 py-3 text-ccdp-cream/70">{(o.items || []).reduce((n, it) => n + it.quantity, 0)} items</td>
                  <td className="px-4 py-3 font-medium text-ccdp-white">{money(o.amount_total || o.amount_subtotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${o.payment_status === "paid" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-ccdp-cream/60"}`}>{o.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <Select value={o.fulfillment_status || "unfulfilled"} onValueChange={(v) => setFulfillment(o.order_id, v)}>
                        <SelectTrigger data-testid={`fulfillment-${o.order_id}`} className="w-[150px] border-white/15 bg-white/5 text-ccdp-cream"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                          {FULFILLMENT.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <input
                        data-testid={`tracking-${o.order_id}`}
                        defaultValue={o.tracking_number || ""}
                        placeholder="Tracking #"
                        onBlur={(e) => { if (e.target.value !== (o.tracking_number || "")) setFulfillment(o.order_id, o.fulfillment_status || "unfulfilled", e.target.value); }}
                        className="w-[150px] rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
