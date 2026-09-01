import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, quote, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <ShoppingBag size={48} className="text-white/20" />
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <Link to="/departments" className="rounded-full bg-[#0a44ff] px-7 py-3.5 font-head text-sm text-white hover:bg-[#0836cc]">
          Explore the marketplaces
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10">
      <h1 className="mb-10 font-display text-4xl font-medium md:text-5xl">Your Bag</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-5 border-b border-white/10 pb-6" data-testid={`cart-page-line-${it.slug}`}>
              <Link to={`/product/${it.slug}`}>
                <PlaceholderMedia icon={it.icon} accent={it.accent} className="h-32 w-28 shrink-0 rounded-xl" iconClassName="!size-10" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-white/40">{it.brand}</p>
                    <Link to={`/product/${it.slug}`} className="font-head text-lg font-medium hover:text-white/70">
                      {it.name}
                    </Link>
                    {it.variant && (
                      <p className="mt-1 font-body text-sm text-white/40">{Object.values(it.variant).join(" · ")}</p>
                    )}
                  </div>
                  <span className="font-head text-lg">{formatPrice(it.price * it.quantity)}</span>
                </div>
                <div className="mt-auto flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-4 rounded-full border border-white/15 px-4 py-2">
                    <button onClick={() => updateQty(idx, it.quantity - 1)} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center font-head text-sm">{it.quantity}</span>
                    <button onClick={() => updateQty(idx, it.quantity + 1)} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(idx)} className="flex items-center gap-1.5 font-body text-sm text-white/40 hover:text-[#ff2bd0]" data-testid={`cart-page-remove-${it.slug}`}>
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-7">
            <h2 className="font-head text-xl font-semibold">Order Summary</h2>
            <div className="mt-6 space-y-3 font-body text-sm">
              <Row label="Subtotal" value={formatPrice(quote?.subtotal ?? 0)} />
              {quote?.discount > 0 && <Row label="Discount" value={`-${formatPrice(quote.discount)}`} accent />}
              <Row label="Shipping" value={quote?.shipping ? formatPrice(quote.shipping) : "Free"} />
              <Row label="Estimated tax" value={formatPrice(quote?.tax ?? 0)} />
              <div className="border-t border-white/10 pt-3">
                <Row label="Total" value={formatPrice(quote?.total ?? 0)} bold />
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              data-testid="cart-page-checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-4 font-head text-sm font-semibold text-white hover:bg-[#0836cc]"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <p className="mt-4 text-center font-body text-xs text-white/40">
              Apple Pay · Google Pay · PayPal · Shop Pay · Cards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }) {
  return (
    <div className={`flex justify-between ${bold ? "font-head text-base text-white" : "text-white/60"} ${accent ? "text-[#4d7cff]" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
