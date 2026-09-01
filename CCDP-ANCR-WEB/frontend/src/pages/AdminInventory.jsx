import { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw, Boxes, AlertTriangle, XCircle } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuth";
import { Seo } from "../components/Seo";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

const statusOf = (v) => {
  if (!v.active) return { label: "Disabled", cls: "bg-white/10 text-ccdp-cream/50" };
  if (v.soldOut) return { label: "Sold Out", cls: "bg-red-500/15 text-red-300" };
  if (v.lowStock) return { label: "Low Stock", cls: "bg-amber-500/20 text-amber-300" };
  if (!v.trackInventory) return { label: "Untracked", cls: "bg-sky-500/15 text-sky-300" };
  return { label: "In Stock", cls: "bg-emerald-500/15 text-emerald-300" };
};

export default function AdminInventory() {
  const { user, ready, logout, authApi } = useAdminAuth();
  const [data, setData] = useState({ variants: [], totalSkus: 0, lowStockCount: 0, soldOutCount: 0, collections: [] });
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (collection !== "all") params.collection = collection;
      if (lowOnly) params.lowOnly = true;
      if (search) params.search = search;
      const { data } = await authApi.get("/store/admin/inventory", { params });
      setData(data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      else toast.error("Failed to load inventory.");
    } finally { setLoading(false); }
  }, [collection, lowOnly, search]); // eslint-disable-line

  useEffect(() => { if (ready && user) load(); }, [ready, user, collection, lowOnly]); // eslint-disable-line

  if (ready && !user) return <Navigate to="/admin/login" replace />;
  if (!ready) return <div className="grid min-h-screen place-items-center bg-ccdp-black text-ccdp-cream"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const patch = async (sku, body) => {
    try {
      const { data: v } = await authApi.patch(`/store/admin/inventory/${sku}`, body);
      setData((d) => ({ ...d, variants: d.variants.map((x) => (x.sku === sku ? { ...x, ...v } : x)) }));
      toast.success("Updated.");
      load();
    } catch { toast.error("Update failed."); }
  };

  return (
    <div className="min-h-screen bg-ccdp-black text-ccdp-cream" data-testid="admin-inventory">
      <Seo title="Inventory" noindex />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ccdp-black/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-ccdp-gradient px-3 py-1.5 font-display text-sm font-extrabold text-white">CCDP CRM</span>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/admin/inquiries" className="text-ccdp-cream/60 hover:text-ccdp-white">Inquiries</Link>
              <Link to="/admin/waitlist" className="text-ccdp-cream/60 hover:text-ccdp-white">Shop Waitlist</Link>
              <Link to="/admin/orders" className="text-ccdp-cream/60 hover:text-ccdp-white">Orders</Link>
              <Link to="/admin/inventory" className="font-semibold text-ccdp-white">Inventory</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ccdp-cream/70">{user?.name}</span>
            <Button onClick={logout} variant="ghost" size="sm" className="text-ccdp-cream/70 hover:text-ccdp-white"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><Boxes className="h-3.5 w-3.5" /> Total SKUs</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-total-skus">{data.totalSkus}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><AlertTriangle className="h-3.5 w-3.5" /> Low stock</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-300" data-testid="stat-low-stock">{data.lowStockCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50"><XCircle className="h-3.5 w-3.5" /> Sold out</p>
            <p className="mt-1 font-display text-2xl font-bold text-red-300" data-testid="stat-sold-out">{data.soldOutCount}</p>
          </div>
          <div className="flex items-center justify-end rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <Button onClick={load} variant="outline" className="border-white/15 bg-transparent text-ccdp-cream"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger data-testid="inv-collection-filter" className="w-[200px] border-white/15 bg-white/5 text-ccdp-cream"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
              <SelectItem value="all">All collections</SelectItem>
              {data.collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search product or SKU…" data-testid="inv-search"
            className="w-[240px] rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none" />
          <label className="flex items-center gap-2 text-sm text-ccdp-cream/70"><Switch checked={lowOnly} onCheckedChange={setLowOnly} data-testid="inv-low-toggle" /> Low stock only</label>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ccdp-cream/45">
                <th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Stock</th><th className="px-4 py-3">Low at</th><th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Active</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-ccdp-cream/50"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : data.variants.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-ccdp-cream/50">No SKUs match.</td></tr>
              ) : data.variants.map((v) => {
                const st = statusOf(v);
                return (
                  <tr key={v.sku} data-testid={`inv-row-${v.sku}`} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={v.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        <div><p className="text-ccdp-white">{v.productName}</p><p className="text-[11px] text-ccdp-cream/40">{v.collectionName}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ccdp-cream/60">{v.sku}</td>
                    <td className="px-4 py-3 text-ccdp-cream/70">{v.size}</td>
                    <td className="px-4 py-3">
                      <input type="number" min={0} defaultValue={v.stock} data-testid={`inv-stock-${v.sku}`}
                        onBlur={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n) && n !== v.stock) patch(v.sku, { stock: n }); }}
                        className="w-20 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-ccdp-cream focus:border-white/40 focus:outline-none" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min={0} defaultValue={v.lowStockThreshold} data-testid={`inv-threshold-${v.sku}`}
                        onBlur={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n) && n !== v.lowStockThreshold) patch(v.sku, { lowStockThreshold: n }); }}
                        className="w-16 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-ccdp-cream focus:border-white/40 focus:outline-none" />
                    </td>
                    <td className="px-4 py-3"><Switch checked={v.trackInventory} onCheckedChange={(c) => patch(v.sku, { trackInventory: c })} /></td>
                    <td className="px-4 py-3"><Switch checked={v.active} onCheckedChange={(c) => patch(v.sku, { active: c })} data-testid={`inv-active-${v.sku}`} /></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
