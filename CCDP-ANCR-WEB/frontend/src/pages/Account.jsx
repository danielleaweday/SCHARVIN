import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Package, Heart, MapPin, User, LogOut, Trash2, Plus, Loader2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { useStore } from "../context/StoreProvider";
import { storeApi, money } from "../lib/storeApi";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Favorites", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
];

const EMPTY_ADDR = { label: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" };

export default function Account() {
  const navigate = useNavigate();
  const { user, authLoading, logout, productsById, toggleWishlist, refreshUser } = useStore();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR);
  const [name, setName] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/store/login", { replace: true });
    if (user) setName(user.name || "");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    storeApi.get("/orders").then((r) => setOrders(r.data.orders)).catch(() => {});
    storeApi.get("/addresses").then((r) => setAddresses(r.data.addresses)).catch(() => {});
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-ccdp-black">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center pt-[128px] text-ccdp-cream/60"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </div>
    );
  }

  const wishlist = (user.wishlist || []).map((id) => productsById[id]).filter(Boolean);

  const saveProfile = async () => {
    try {
      await storeApi.put("/account", { name });
      await refreshUser();
      toast.success("Profile updated.");
    } catch { toast.error("Could not update profile."); }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const r = await storeApi.post("/addresses", newAddr);
      setAddresses(r.data.addresses);
      setNewAddr(EMPTY_ADDR);
      toast.success("Address saved.");
    } catch { toast.error("Could not save address."); }
    finally { setSavingAddr(false); }
  };

  const removeAddress = async (id) => {
    try {
      const r = await storeApi.delete(`/addresses/${id}`);
      setAddresses(r.data.addresses);
    } catch { toast.error("Could not remove address."); }
  };

  const ai = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none";

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="My Account" description="Manage your CCDP powered by ANCR store account." noindex />
      <Navbar />
      <section className="pt-[128px] md:pt-[150px]">
        <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ccdp-white">Hi, {user.name || "creator"}</h1>
              <p className="text-sm text-ccdp-cream/55">{user.email}</p>
            </div>
            <button onClick={() => { logout(); navigate("/store"); }} data-testid="logout-btn" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-ccdp-cream/80 hover:border-white/40"><LogOut className="h-4 w-4" /> Sign Out</button>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10 pb-px">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} data-testid={`account-tab-${t.id}`}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? "border-ccdp-purple text-ccdp-white" : "border-transparent text-ccdp-cream/55 hover:text-ccdp-white"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === "orders" && (
              <div data-testid="account-orders">
                {orders.length === 0 ? (
                  <p className="py-16 text-center text-ccdp-cream/50">No orders yet. <Link to="/store" className="text-gradient">Start shopping →</Link></p>
                ) : orders.map((o) => (
                  <div key={o.order_id} data-testid={`order-${o.order_id}`} className="mb-4 rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-ccdp-cream/50">Order {o.order_id}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ccdp-cream/70">{o.fulfillment_status}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-ccdp-cream/75">
                      {o.items?.map((it, i) => <div key={i} className="flex justify-between"><span>{it.name} · {it.size} × {it.quantity}</span><span>{money(it.unitPrice * it.quantity)}</span></div>)}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm font-semibold text-ccdp-white"><span>Total</span><span>{money(o.amount_total || o.amount_subtotal)}</span></div>
                  </div>
                ))}
              </div>
            )}

            {tab === "wishlist" && (
              <div data-testid="account-wishlist" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {wishlist.length === 0 ? <p className="col-span-full py-16 text-center text-ccdp-cream/50">No favorites yet.</p> : wishlist.map((p) => (
                  <div key={p.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/40">
                    <Link to={`/store/product/${p.id}`} className="block aspect-square overflow-hidden bg-black"><img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></Link>
                    <div className="p-3">
                      <p className="text-sm font-medium text-ccdp-white">{p.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-ccdp-cream/60">{money(p.price)}</span>
                        <button onClick={() => toggleWishlist(p.id)} className="text-ccdp-cream/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "addresses" && (
              <div data-testid="account-addresses" className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-3">
                  {addresses.length === 0 && <p className="text-ccdp-cream/50">No saved addresses.</p>}
                  {addresses.map((a) => (
                    <div key={a.id} className="flex items-start justify-between rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-4 text-sm text-ccdp-cream/75">
                      <div>
                        {a.label && <p className="font-semibold text-ccdp-white">{a.label}</p>}
                        <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                        <p>{a.city}, {a.state} {a.postalCode} · {a.country}</p>
                      </div>
                      <button onClick={() => removeAddress(a.id)} className="text-ccdp-cream/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <form onSubmit={addAddress} className="space-y-3 rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-5">
                  <p className="font-display text-lg font-semibold text-ccdp-white">Add address</p>
                  <input placeholder="Label (e.g. Home)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className={ai} data-testid="addr-label" />
                  <input required placeholder="Address line 1" value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} className={ai} data-testid="addr-line1" />
                  <input placeholder="Address line 2 (optional)" value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} className={ai} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className={ai} data-testid="addr-city" />
                    <input placeholder="State/Province" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className={ai} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Postal code" value={newAddr.postalCode} onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })} className={ai} data-testid="addr-postal" />
                    <input required maxLength={2} placeholder="Country (US)" value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value.toUpperCase() })} className={ai} data-testid="addr-country" />
                  </div>
                  <button type="submit" disabled={savingAddr} data-testid="addr-save" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ccdp-gradient py-3 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Save Address</button>
                </form>
              </div>
            )}

            {tab === "profile" && (
              <div data-testid="account-profile" className="max-w-md space-y-4">
                <div>
                  <label className="overline text-ccdp-cream/50">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={`${ai} mt-2`} data-testid="profile-name" />
                </div>
                <div>
                  <label className="overline text-ccdp-cream/50">Email</label>
                  <input value={user.email} disabled className={`${ai} mt-2 opacity-60`} />
                </div>
                <button onClick={saveProfile} data-testid="profile-save" className="rounded-full bg-ccdp-gradient px-7 py-3 text-sm font-semibold text-white">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
