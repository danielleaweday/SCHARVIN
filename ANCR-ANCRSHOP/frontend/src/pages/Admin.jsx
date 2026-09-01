import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Ticket, Users, Plus, Trash2, DollarSign,
  TrendingUp, AlertTriangle, Loader2,
} from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const TABS = [
  ["overview", "Overview", LayoutDashboard],
  ["products", "Products", Package],
  ["orders", "Orders", ShoppingCart],
  ["coupons", "Coupons", Ticket],
  ["customers", "Customers", Users],
];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (user === false) navigate("/login");
    if (user && !["admin", "superadmin"].includes(user.role)) navigate("/");
  }, [user, navigate]);

  if (!user) return <div className="py-32 text-center font-body text-white/40">Loading…</div>;

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
      <h1 className="font-display text-4xl font-medium">Commerce Admin</h1>
      <p className="mt-1 font-body text-white/50">ANCRSHOP™ management console</p>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10">
        {TABS.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            data-testid={`admin-tab-${id}`}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-head text-sm transition-colors ${
              tab === id ? "border-[#0a44ff] text-white" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "products" && <Products />}
        {tab === "orders" && <Orders />}
        {tab === "coupons" && <Coupons />}
        {tab === "customers" && <Customers />}
      </div>
    </div>
  );
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setS(r.data)).catch(() => {});
  }, []);
  if (!s) return <Loader />;
  const cards = [
    ["Revenue", formatPrice(s.revenue), DollarSign, "#0a44ff"],
    ["Paid Orders", s.paid_orders, ShoppingCart, "#8a2be2"],
    ["Avg Order Value", formatPrice(s.aov), TrendingUp, "#ff2bd0"],
    ["Customers", s.customers, Users, "#ffa500"],
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, val, Icon, color]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#121212] p-6" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <Icon size={20} style={{ color }} />
            <p className="mt-3 font-head text-2xl font-semibold">{val}</p>
            <p className="font-body text-sm text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#ffa500]" />
            <h3 className="font-head font-semibold">Inventory alerts</h3>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="font-head text-3xl">{s.low_stock}</p>
              <p className="font-body text-sm text-white/50">Low stock</p>
            </div>
            <div>
              <p className="font-head text-3xl">{s.out_of_stock}</p>
              <p className="font-body text-sm text-white/50">Out of stock</p>
            </div>
            <div>
              <p className="font-head text-3xl">{s.products}</p>
              <p className="font-body text-sm text-white/50">Total products</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <h3 className="mb-4 font-head font-semibold">Revenue by department</h3>
          <div className="space-y-2">
            {s.top_departments.map((d) => (
              <div key={d.department} className="flex items-center justify-between font-body text-sm">
                <span className="text-white/60">{d.department}</span>
                <span className="font-head">{formatPrice(d.revenue)}</span>
              </div>
            ))}
            {s.top_departments.length === 0 && <p className="font-body text-sm text-white/40">No paid orders yet.</p>}
          </div>
        </div>
      </div>

      <h3 className="mb-4 mt-8 font-head font-semibold">Recent orders</h3>
      <OrderTable orders={s.recent_orders} />
    </div>
  );
}

function Products() {
  const [data, setData] = useState({ items: [] });
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "ANCR", department: "official-ancr-collections", category: "General", price: 49.99, stock: 100, icon: "Package", accent: "a" });

  const load = () => api.get(`/admin/products?q=${q}&limit=40`).then((r) => setData(r.data));
  useEffect(() => { load(); }, [q]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/products", { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
      toast.success("Product created");
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const del = async (id) => {
    await api.delete(`/admin/products/${id}`);
    toast.success("Deleted");
    load();
  };

  const updateStock = async (id, stock) => {
    await api.put(`/admin/products/${id}`, { stock: parseInt(stock) || 0 });
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          data-testid="admin-product-search"
          className="w-72 rounded-full border border-white/15 bg-transparent px-4 py-2.5 font-body text-sm focus:outline-none"
        />
        <button onClick={() => setShowForm((v) => !v)} data-testid="admin-new-product" className="flex items-center gap-2 rounded-full bg-[#0a44ff] px-5 py-2.5 font-head text-sm text-white">
          <Plus size={16} /> New product
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#121212] p-5 md:grid-cols-3" data-testid="admin-product-form">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <input placeholder="Department slug" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
          <button type="submit" data-testid="admin-product-save" className="rounded-lg bg-white py-2 font-head text-sm font-semibold text-black md:col-span-3">Save product</button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left font-body text-sm">
          <thead className="border-b border-white/10 text-white/50">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Dept</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-b border-white/5" data-testid={`admin-product-row-${p.slug}`}>
                <td className="p-4">
                  <p className="font-head font-medium">{p.name}</p>
                  <p className="text-xs text-white/40">{p.brand}</p>
                </td>
                <td className="p-4 text-white/60">{p.department}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    onBlur={(e) => updateStock(p.id, e.target.value)}
                    className={`w-20 rounded border bg-transparent px-2 py-1 ${p.stock === 0 ? "border-[#ff2bd0]/50 text-[#ff2bd0]" : p.stock <= 8 ? "border-[#ffa500]/50 text-[#ffa500]" : "border-white/15"}`}
                  />
                </td>
                <td className="p-4">
                  <button onClick={() => del(p.id)} data-testid={`admin-delete-${p.slug}`} aria-label="Delete">
                    <Trash2 size={16} className="text-white/40 hover:text-[#ff2bd0]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const fulfill = async (num, status) => {
    await api.put(`/admin/orders/${num}/fulfill`, { fulfillment_status: status });
    toast.success("Order updated");
    load();
  };
  return <OrderTable orders={orders} onFulfill={fulfill} />;
}

function OrderTable({ orders, onFulfill }) {
  if (!orders?.length) return <p className="font-body text-sm text-white/40">No orders yet.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left font-body text-sm">
        <thead className="border-b border-white/10 text-white/50">
          <tr>
            <th className="p-4">Order</th>
            <th className="p-4">Customer</th>
            <th className="p-4">Total</th>
            <th className="p-4">Payment</th>
            <th className="p-4">Fulfillment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id || o.order_number} className="border-b border-white/5" data-testid={`admin-order-${o.order_number}`}>
              <td className="p-4 font-head">{o.order_number}</td>
              <td className="p-4 text-white/60">{o.email || "guest"}</td>
              <td className="p-4">{formatPrice(o.total)}</td>
              <td className="p-4">
                <span className={`rounded-full px-2.5 py-1 text-xs ${o.payment_status === "paid" ? "bg-[#0a44ff]/20 text-[#7da2ff]" : "bg-white/10 text-white/50"}`}>
                  {o.payment_status}
                </span>
              </td>
              <td className="p-4">
                {onFulfill ? (
                  <select
                    value={o.fulfillment_status || "unfulfilled"}
                    onChange={(e) => onFulfill(o.order_number, e.target.value)}
                    data-testid={`fulfill-${o.order_number}`}
                    className="rounded-lg border border-white/15 bg-[#0a0a0a] px-2 py-1 text-xs"
                  >
                    {["unfulfilled", "processing", "fulfilled", "returned"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-white/50">{o.fulfillment_status || "unfulfilled"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percent", value: 10, min_order: 0, description: "" });
  const load = () => api.get("/admin/coupons").then((r) => setCoupons(r.data));
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/coupons", { ...form, value: parseFloat(form.value), min_order: parseFloat(form.min_order) });
      toast.success("Coupon created");
      setForm({ code: "", type: "percent", value: 10, min_order: 0, description: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };
  const del = async (id) => { await api.delete(`/admin/coupons/${id}`); load(); };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={create} className="space-y-3 rounded-2xl border border-white/10 bg-[#121212] p-5" data-testid="admin-coupon-form">
        <h3 className="font-head font-semibold">Create coupon</h3>
        <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 font-body text-sm">
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
        <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
        <input type="number" placeholder="Min order" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm" />
        <button type="submit" data-testid="admin-coupon-save" className="w-full rounded-lg bg-white py-2 font-head text-sm font-semibold text-black">Create</button>
      </form>
      <div className="space-y-3 lg:col-span-2">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] p-4" data-testid={`admin-coupon-${c.code}`}>
            <div>
              <p className="font-head text-lg">{c.code}</p>
              <p className="font-body text-sm text-white/50">
                {c.type === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`} · min {formatPrice(c.min_order)}
              </p>
            </div>
            <button onClick={() => del(c.id)} aria-label="Delete coupon"><Trash2 size={16} className="text-white/40 hover:text-[#ff2bd0]" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { api.get("/admin/customers").then((r) => setCustomers(r.data)); }, []);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left font-body text-sm">
        <thead className="border-b border-white/10 text-white/50">
          <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Points</th><th className="p-4">Orders</th></tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <td className="p-4 font-head font-medium">{c.name}</td>
              <td className="p-4 text-white/60">{c.email}</td>
              <td className="p-4"><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs">{c.role}</span></td>
              <td className="p-4">{c.loyalty_points ?? 0}</td>
              <td className="p-4">{c.order_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Loader() {
  return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white/40" /></div>;
}
