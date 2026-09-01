import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, Lock } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { useStore } from "../context/StoreProvider";
import { storeApi, money } from "../lib/storeApi";

export default function Cart() {
  const { cartDetailed, cartTotal, updateQty, removeFromCart, user } = useStore();
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (cartDetailed.length === 0) return;
    if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      toast.error("Enter a valid email to check out as a guest, or sign in.");
      return;
    }
    setLoading(true);
    try {
      const items = cartDetailed.map((c) => ({ productId: c.productId, size: c.size, quantity: c.quantity }));
      const body = { items, origin_url: window.location.origin };
      if (!user) body.email = guestEmail;
      const r = await storeApi.post("/checkout", body);
      window.location.href = r.data.checkout_url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Cart" description="Your CCDP powered by ANCR store cart." noindex />
      <Navbar />

      <section className="pt-[128px] md:pt-[150px]">
        <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ccdp-white sm:text-4xl">Your Cart</h1>

          {cartDetailed.length === 0 ? (
            <div data-testid="cart-empty" className="mt-16 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-ccdp-charcoal/40 py-24 text-center">
              <ShoppingBag className="h-12 w-12 text-ccdp-cream/40" />
              <p className="text-ccdp-cream/60">Your cart is empty.</p>
              <Link to="/store" data-testid="cart-shop-link" className="rounded-full bg-ccdp-gradient px-7 py-3 text-sm font-semibold text-white">Browse the Store</Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4" data-testid="cart-items">
                {cartDetailed.map((c) => (
                  <div key={`${c.productId}-${c.size}`} data-testid={`cart-item-${c.productId}-${c.size}`} className="flex gap-4 rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-4">
                    <Link to={`/store/product/${c.productId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black">
                      <img src={c.product.image} alt={c.product.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: c.product.accent }}>{c.product.collectionName}</span>
                      <p className="font-display text-base font-semibold text-ccdp-white">{c.product.name}</p>
                      <p className="text-xs text-ccdp-cream/50">Size: {c.size}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-white/15">
                          <button onClick={() => updateQty(c.productId, c.size, c.quantity - 1)} data-testid={`cart-minus-${c.productId}`} className="grid h-8 w-8 place-items-center text-ccdp-cream"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-7 text-center text-sm text-ccdp-white">{c.quantity}</span>
                          <button onClick={() => updateQty(c.productId, c.size, c.quantity + 1)} data-testid={`cart-plus-${c.productId}`} className="grid h-8 w-8 place-items-center text-ccdp-cream"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-ccdp-cream">{money(c.product.price * c.quantity)}</span>
                          <button onClick={() => removeFromCart(c.productId, c.size)} data-testid={`cart-remove-${c.productId}`} aria-label="Remove" className="text-ccdp-cream/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-2xl border border-white/10 bg-ccdp-charcoal/50 p-6" data-testid="cart-summary">
                <h2 className="font-display text-lg font-semibold text-ccdp-white">Order Summary</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-ccdp-cream/70"><span>Subtotal</span><span data-testid="cart-subtotal" className="text-ccdp-cream">{money(cartTotal)}</span></div>
                  <div className="flex justify-between text-ccdp-cream/70"><span>Shipping & tax</span><span className="text-ccdp-cream/50">Calculated at checkout</span></div>
                </div>
                <div className="my-5 h-px bg-white/10" />

                {!user && (
                  <div className="mb-4">
                    <label className="overline text-ccdp-cream/50">Guest checkout email</label>
                    <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" placeholder="you@email.com" data-testid="guest-email-input"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-ccdp-cream placeholder:text-ccdp-cream/35 focus:border-white/40 focus:outline-none" />
                    <Link to="/store/login" className="mt-2 inline-block text-xs text-ccdp-cream/50 hover:text-gradient">or sign in for faster checkout →</Link>
                  </div>
                )}

                <button onClick={checkout} disabled={loading} data-testid="checkout-btn"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ccdp-gradient py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : <><Lock className="h-4 w-4" /> Secure Checkout</>}
                </button>
                <p className="mt-3 text-center text-[11px] text-ccdp-cream/40">Payments processed securely by Stripe.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
