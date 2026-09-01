import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Tag, Check } from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const PAYMENTS = ["Card", "Apple Pay", "Google Pay", "PayPal", "Shop Pay"];

export default function Checkout() {
  const { items, quote, coupon, setCoupon, refreshQuote } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <Link to="/departments" className="rounded-full bg-[#0a44ff] px-7 py-3.5 font-head text-sm text-white">
          Continue shopping
        </Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!codeInput.trim()) return;
    setApplying(true);
    try {
      await api.post("/coupons/validate", { code: codeInput, subtotal: quote?.subtotal ?? 0 });
      setCoupon(codeInput.toUpperCase());
      refreshQuote(codeInput.toUpperCase());
      toast.success("Promo code applied");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid code");
    } finally {
      setApplying(false);
    }
  };

  const checkout = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/payments/checkout", {
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity, variant: i.variant })),
        coupon_code: coupon || null,
        origin_url: window.location.origin,
        email,
        shipping_name: name,
      });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10">
      <h1 className="mb-10 font-display text-4xl font-medium md:text-5xl">Checkout</h1>
      <div className="grid gap-12 lg:grid-cols-2">
        {/* form */}
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 font-head text-lg font-semibold">Contact & Shipping</h2>
            <div className="space-y-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                data-testid="checkout-email"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                data-testid="checkout-name"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shipping address (collected securely at payment)"
                className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 font-body text-sm focus:border-[#0a44ff] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-head text-lg font-semibold">Promo Code</h2>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/15 px-4">
                <Tag size={16} className="text-white/40" />
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="CREATOR10"
                  data-testid="checkout-coupon-input"
                  className="w-full bg-transparent py-3.5 font-body text-sm uppercase focus:outline-none"
                />
              </div>
              <button
                onClick={applyCoupon}
                disabled={applying}
                data-testid="checkout-coupon-apply"
                className="rounded-xl border border-white/20 px-6 font-head text-sm hover:border-white/50"
              >
                {applying ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {coupon && (
              <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-[#4d7cff]">
                <Check size={14} /> {coupon} applied
              </p>
            )}
            <p className="mt-2 font-body text-xs text-white/40">Try: CREATOR10 · STUDENT15 · ANCR25</p>
          </div>

          <div>
            <h2 className="mb-4 font-head text-lg font-semibold">Payment</h2>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <span key={p} className="rounded-full border border-white/15 px-4 py-2 font-body text-xs text-white/60">
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-3 font-body text-xs text-white/40">
              Payments are processed securely by Stripe. Test card 4242 4242 4242 4242.
            </p>
          </div>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-7">
            <div className="mb-6 max-h-64 space-y-4 overflow-y-auto">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <PlaceholderMedia icon={it.icon} accent={it.accent} className="h-14 w-12 shrink-0 rounded-lg" iconClassName="!size-5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-head text-sm">{it.name}</p>
                    <p className="font-body text-xs text-white/40">Qty {it.quantity}</p>
                  </div>
                  <span className="font-head text-sm">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-white/10 pt-5 font-body text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{formatPrice(quote?.subtotal ?? 0)}</span>
              </div>
              {quote?.discount > 0 && (
                <div className="flex justify-between text-[#4d7cff]">
                  <span>Discount</span>
                  <span>-{formatPrice(quote.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span>{quote?.shipping ? formatPrice(quote.shipping) : "Free"}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Estimated tax</span>
                <span>{formatPrice(quote?.tax ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-head text-lg text-white">
                <span>Total</span>
                <span>{formatPrice(quote?.total ?? 0)}</span>
              </div>
            </div>
            <button
              onClick={checkout}
              disabled={loading}
              data-testid="checkout-pay-button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-4 font-head text-sm font-semibold text-white transition-all hover:bg-[#0836cc] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  Pay {formatPrice(quote?.total ?? 0)} <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
