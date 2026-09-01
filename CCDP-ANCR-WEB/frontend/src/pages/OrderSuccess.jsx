import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Package, XCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { useStore } from "../context/StoreProvider";
import { storeApi, money } from "../lib/storeApi";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearCart } = useStore();
  const [state, setState] = useState("polling"); // polling | paid | failed | error
  const [order, setOrder] = useState(null);
  const attempts = useRef(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    let timer;
    const poll = async () => {
      try {
        const r = await storeApi.get(`/checkout/status/${sessionId}`);
        setOrder(r.data.order);
        if (r.data.payment_status === "paid") {
          setState("paid");
          if (!cleared.current) {
            clearCart();
            cleared.current = true;
          }
          return;
        }
        if (["failed", "expired"].includes(r.data.payment_status)) {
          setState("failed");
          return;
        }
        attempts.current += 1;
        if (attempts.current > 12) {
          setState("error");
          return;
        }
        timer = setTimeout(poll, 2000);
      } catch {
        setState("error");
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title="Order Confirmation" description="Your CCDP powered by ANCR order confirmation." noindex />
      <Navbar />
      <section className="flex min-h-[70vh] items-center justify-center pt-[128px]">
        <div className="mx-auto w-full max-w-lg px-5 text-center">
          {state === "polling" && (
            <div data-testid="order-polling" className="flex flex-col items-center gap-4 text-ccdp-cream/70">
              <Loader2 className="h-10 w-10 animate-spin text-gradient" />
              <p>Confirming your payment…</p>
            </div>
          )}

          {state === "paid" && (
            <div data-testid="order-success" className="rounded-3xl border border-white/10 bg-ccdp-charcoal/40 p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ccdp-gradient text-white"><CheckCircle2 className="h-8 w-8" /></span>
              <h1 className="mt-6 font-display text-3xl font-semibold text-ccdp-white">Thank you for your order!</h1>
              <p className="mt-3 text-sm text-ccdp-cream/65">A confirmation is on its way. We'll email you shipping updates.</p>
              {order && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-left text-sm">
                  <p className="text-ccdp-cream/50">Order <span className="text-ccdp-white">{order.order_id}</span></p>
                  <div className="mt-3 space-y-2">
                    {order.items?.map((it, i) => (
                      <div key={i} className="flex justify-between text-ccdp-cream/75">
                        <span>{it.name} · {it.size} × {it.quantity}</span>
                        <span>{money(it.unitPrice * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold text-ccdp-white">
                    <span>Total paid</span><span>{money(order.amount_total || order.amount_subtotal)}</span>
                  </div>
                </div>
              )}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/store/account" data-testid="view-orders-link" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-ccdp-white hover:border-white/50"><Package className="h-4 w-4" /> My Orders</Link>
                <Link to="/store" className="rounded-full bg-ccdp-gradient px-6 py-3 text-sm font-semibold text-white">Keep Shopping</Link>
              </div>
            </div>
          )}

          {(state === "failed" || state === "error") && (
            <div data-testid="order-failed" className="rounded-3xl border border-white/10 bg-ccdp-charcoal/40 p-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-500/20 text-red-400"><XCircle className="h-8 w-8" /></span>
              <h1 className="mt-6 font-display text-2xl font-semibold text-ccdp-white">We couldn't confirm your payment.</h1>
              <p className="mt-3 text-sm text-ccdp-cream/65">If you were charged, contact awe@aweday.org and we'll help right away.</p>
              <Link to="/store/cart" className="mt-7 inline-block rounded-full bg-ccdp-gradient px-6 py-3 text-sm font-semibold text-white">Back to Cart</Link>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
