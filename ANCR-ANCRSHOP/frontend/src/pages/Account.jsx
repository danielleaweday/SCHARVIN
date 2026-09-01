import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, LogOut, Award, ShieldCheck } from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user === false) navigate("/login");
    if (user) api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, [user, navigate]);

  if (!user) return <div className="py-32 text-center font-body text-white/40">Loading…</div>;

  const isAdmin = ["admin", "superadmin"].includes(user.role);

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.2em] text-white/40">{user.role}</p>
          <h1 className="mt-1 font-display text-4xl font-medium md:text-5xl">Hi, {user.name}</h1>
          <p className="mt-2 font-body text-white/50">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Link to="/admin" data-testid="account-admin-link" className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-head text-sm hover:border-white/50">
              <ShieldCheck size={15} /> Admin
            </Link>
          )}
          <button onClick={() => { logout(); navigate("/"); }} data-testid="account-logout" className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-head text-sm hover:border-white/50">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {/* loyalty */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <Award size={22} className="text-[#ffa500]" />
          <p className="mt-3 font-head text-2xl font-semibold">{user.loyalty_points ?? 0}</p>
          <p className="font-body text-sm text-white/50">Reward points</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <p className="font-body text-xs uppercase tracking-wider text-white/40">Loyalty Tier</p>
          <p className="mt-2 font-head text-2xl font-semibold text-ccdp-gradient">{user.loyalty_tier || "Explorer"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <p className="font-body text-xs uppercase tracking-wider text-white/40">Orders</p>
          <p className="mt-2 font-head text-2xl font-semibold">{orders.length}</p>
        </div>
      </div>

      {/* orders */}
      <h2 className="mb-6 mt-14 font-head text-2xl font-semibold">Order history</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-10 text-center">
          <Package size={36} className="mx-auto text-white/20" />
          <p className="mt-4 font-body text-white/50">No orders yet.</p>
          <Link to="/departments" className="mt-5 inline-block rounded-full bg-[#0a44ff] px-6 py-3 font-head text-sm text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6" data-testid={`order-${o.order_number}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-head font-semibold">{o.order_number}</p>
                  <p className="font-body text-xs text-white/40">
                    {new Date(o.created_at).toLocaleDateString()} · {o.items?.length} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 font-head text-xs ${o.payment_status === "paid" ? "bg-[#0a44ff]/20 text-[#7da2ff]" : "bg-white/10 text-white/50"}`}>
                    {o.payment_status === "paid" ? "Paid" : o.payment_status}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 font-head text-xs text-white/60">
                    {o.fulfillment_status || "unfulfilled"}
                  </span>
                  <span className="font-head text-lg">{formatPrice(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
