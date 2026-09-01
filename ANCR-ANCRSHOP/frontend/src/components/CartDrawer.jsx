import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, quote, drawerOpen, setDrawerOpen, updateQty, removeItem, count } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setDrawerOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0a0a]"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <h2 className="font-head text-lg font-semibold">Your Bag ({count})</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close bag" data-testid="cart-drawer-close">
                <X size={22} className="text-white/60 hover:text-white" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag size={40} className="text-white/20" />
                <p className="font-head text-lg text-white/70">Your bag is empty</p>
                <Link
                  to="/departments"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full bg-[#0a44ff] px-6 py-3 font-head text-sm text-white hover:bg-[#0836cc]"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-4" data-testid={`cart-line-${it.slug}`}>
                      <PlaceholderMedia
                        icon={it.icon}
                        accent={it.accent}
                        className="h-24 w-20 shrink-0 rounded-xl"
                        iconClassName="!size-8"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="font-body text-[11px] uppercase tracking-wider text-white/40">
                              {it.brand}
                            </p>
                            <h4 className="font-head text-sm font-medium leading-snug">{it.name}</h4>
                            {it.variant && (
                              <p className="mt-0.5 font-body text-xs text-white/40">
                                {Object.values(it.variant).join(" · ")}
                              </p>
                            )}
                          </div>
                          <button onClick={() => removeItem(idx)} aria-label="Remove" data-testid={`cart-remove-${it.slug}`}>
                            <Trash2 size={15} className="text-white/40 hover:text-[#ff2bd0]" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3 rounded-full border border-white/15 px-2 py-1">
                            <button onClick={() => updateQty(idx, it.quantity - 1)} aria-label="Decrease">
                              <Minus size={13} />
                            </button>
                            <span className="w-4 text-center font-head text-sm">{it.quantity}</span>
                            <button onClick={() => updateQty(idx, it.quantity + 1)} aria-label="Increase">
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="font-head text-sm">{formatPrice(it.price * it.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-6 py-5">
                  <div className="mb-4 space-y-1.5 font-body text-sm">
                    <div className="flex justify-between text-white/60">
                      <span>Subtotal</span>
                      <span>{formatPrice(quote?.subtotal ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Shipping</span>
                      <span>{quote?.shipping ? formatPrice(quote.shipping) : "Free"}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-head text-base text-white">
                      <span>Estimated total</span>
                      <span>{formatPrice(quote?.total ?? 0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={goCheckout}
                    data-testid="cart-drawer-checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-3.5 font-head text-sm font-semibold text-white transition-all hover:bg-[#0836cc]"
                  >
                    Checkout <ArrowRight size={16} />
                  </button>
                  <Link
                    to="/cart"
                    onClick={() => setDrawerOpen(false)}
                    className="mt-3 block text-center font-body text-xs text-white/50 hover:text-white"
                  >
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
