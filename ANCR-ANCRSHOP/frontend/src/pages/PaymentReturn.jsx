import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, Package } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function PaymentReturn({ status }) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState(status === "cancel" ? "cancelled" : "checking");
  const [orderNumber, setOrderNumber] = useState(null);
  const { clear } = useCart();
  const attempts = useRef(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (status === "cancel" || !sessionId) return;
    let timer;
    const poll = async () => {
      attempts.current += 1;
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        setOrderNumber(data.order_number);
        if (data.payment_status === "paid") {
          setState("success");
          if (!cleared.current) {
            clear();
            cleared.current = true;
          }
          return;
        }
        if (["failed", "expired"].includes(data.payment_status)) {
          setState("failed");
          return;
        }
      } catch {}
      if (attempts.current >= 8) {
        setState("pending");
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId, status, clear]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-10 text-center">
        {state === "checking" && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-[#0a44ff]" />
            <h1 className="mt-6 font-display text-2xl">Confirming your payment…</h1>
            <p className="mt-2 font-body text-sm text-white/50">This only takes a moment.</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 size={56} className="mx-auto text-[#0a44ff]" />
            <h1 className="mt-6 font-display text-3xl">Order confirmed</h1>
            <p className="mt-3 font-body text-white/60">
              Thank you for shopping ANCRSHOP™. A confirmation has been sent to your email.
            </p>
            {orderNumber && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 font-head text-sm">
                <Package size={16} /> {orderNumber}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Link to="/account" data-testid="success-view-orders" className="rounded-full bg-white py-3 font-head text-sm font-semibold text-black">
                View my orders
              </Link>
              <Link to="/departments" className="rounded-full border border-white/20 py-3 font-head text-sm">
                Continue shopping
              </Link>
            </div>
          </>
        )}
        {state === "cancelled" && (
          <>
            <XCircle size={52} className="mx-auto text-white/40" />
            <h1 className="mt-6 font-display text-2xl">Checkout cancelled</h1>
            <p className="mt-2 font-body text-white/50">Your bag is saved. Ready when you are.</p>
            <Link to="/cart" className="mt-8 inline-block rounded-full bg-[#0a44ff] px-8 py-3 font-head text-sm text-white">
              Back to bag
            </Link>
          </>
        )}
        {(state === "failed" || state === "pending") && (
          <>
            <XCircle size={52} className="mx-auto text-[#ff2bd0]" />
            <h1 className="mt-6 font-display text-2xl">
              {state === "pending" ? "Still processing" : "Payment issue"}
            </h1>
            <p className="mt-2 font-body text-white/50">
              {state === "pending"
                ? "Your payment is taking longer than usual. Check your orders shortly."
                : "We couldn't confirm your payment. Please try again."}
            </p>
            <Link to="/cart" className="mt-8 inline-block rounded-full bg-[#0a44ff] px-8 py-3 font-head text-sm text-white">
              Return to bag
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
