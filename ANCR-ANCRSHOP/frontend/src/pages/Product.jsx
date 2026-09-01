import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Check, Truck, ShieldCheck, Download, ChevronDown, Minus, Plus } from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Product() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    setP(null);
    api.get(`/products/${slug}`).then((r) => {
      setP(r.data);
      const v = {};
      (r.data.variants || []).forEach((vr) => (v[vr.type] = vr.options[0]));
      setVariant(v);
    }).catch(() => setP(false));
    // recently viewed
    try {
      const rv = JSON.parse(localStorage.getItem("ancrshop_recent") || "[]").filter((s) => s !== slug);
      localStorage.setItem("ancrshop_recent", JSON.stringify([slug, ...rv].slice(0, 8)));
    } catch {}
  }, [slug]);

  if (p === false)
    return <div className="py-32 text-center font-head text-xl text-white/60">Product not found</div>;
  if (!p) return <div className="py-32 text-center font-body text-white/40">Loading…</div>;

  const soldOut = p.stock === 0;
  const lowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold || 8);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${slug}/reviews`, reviewForm);
      toast.success("Review submitted");
      const r = await api.get(`/products/${slug}`);
      setP(r.data);
      setReviewForm({ rating: 5, title: "", body: "" });
    } catch {
      toast.error("Please sign in to leave a review");
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
      <nav className="mb-8 font-body text-sm text-white/40">
        <Link to="/departments" className="hover:text-white">
          Marketplaces
        </Link>{" "}
        /{" "}
        <Link to={`/shop/${p.department}`} className="hover:text-white">
          {p.department_name}
        </Link>{" "}
        / <span className="text-white/70">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Media */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <PlaceholderMedia
            icon={p.icon}
            accent={p.accent}
            className="aspect-square w-full rounded-3xl border border-white/5"
            iconClassName="!size-40"
            label={p.brand}
          />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {["a", "b", "c", p.accent].map((a, i) => (
              <PlaceholderMedia key={i} icon={p.icon} accent={a} className="aspect-square rounded-xl border border-white/5" iconClassName="!size-8" />
            ))}
          </div>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            {p.badges?.map((b) => (
              <span key={b} className="rounded-full bg-white px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-black">
                {b}
              </span>
            ))}
          </div>
          <p className="mt-4 font-body text-sm uppercase tracking-[0.2em] text-white/40">{p.brand} · {p.category}</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight md:text-5xl">{p.name}</h1>
          <div className="mt-4">
            <StarRating rating={p.rating} count={p.review_count} size={16} />
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-head text-3xl font-semibold">{formatPrice(p.price)}</span>
            {p.compare_at_price && (
              <span className="font-body text-lg text-white/30 line-through">
                {formatPrice(p.compare_at_price)}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-white/70">
            {p.description}
          </p>

          {/* Variants */}
          {(p.variants || []).map((vr) => (
            <div key={vr.type} className="mt-7">
              <p className="mb-2 font-head text-sm font-semibold">{vr.type}</p>
              <div className="flex flex-wrap gap-2">
                {vr.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVariant((v) => ({ ...v, [vr.type]: opt }))}
                    data-testid={`variant-${vr.type}-${opt}`}
                    className={`rounded-full border px-4 py-2 font-body text-sm transition-all ${
                      variant[vr.type] === opt
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/70 hover:border-white/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* qty + add */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-4 rounded-full border border-white/15 px-4 py-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease qty">
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-head">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase qty">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                addItem(p, qty, Object.keys(variant).length ? variant : null);
                toast.success("Added to bag");
              }}
              disabled={soldOut}
              data-testid="pdp-add-to-cart"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0a44ff] py-4 font-head text-sm font-semibold text-white transition-all hover:bg-[#0836cc] disabled:opacity-40"
            >
              {soldOut ? "Sold Out" : "Add to Bag"}
            </button>
            <button
              onClick={() => toggle(p.slug)}
              aria-label="Wishlist"
              data-testid="pdp-wishlist"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/15 hover:border-white/40"
            >
              <Heart size={18} className={has(p.slug) ? "fill-[#ff2bd0] text-[#ff2bd0]" : ""} />
            </button>
          </div>

          {lowStock && (
            <p className="mt-3 font-body text-sm text-[#ffa500]">Only {p.stock} left — order soon</p>
          )}

          <div className="mt-8 space-y-3 border-t border-white/10 pt-6 font-body text-sm text-white/60">
            <p className="flex items-center gap-3">
              {p.is_digital ? <Download size={16} /> : <Truck size={16} />}
              {p.is_digital ? "Instant digital delivery" : "Free shipping on orders over $150"}
            </p>
            <p className="flex items-center gap-3">
              <ShieldCheck size={16} /> Backed by ANCR quality standards
            </p>
          </div>

          {/* features */}
          <div className="mt-8 space-y-2">
            {(p.features || []).map((f, i) => (
              <p key={i} className="flex items-center gap-2 font-body text-sm text-white/70">
                <Check size={15} className="text-[#4d7cff]" /> {f}
              </p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-white/10 pt-14">
        <h2 className="font-head text-2xl font-semibold">Reviews ({p.reviews?.length || 0})</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {(p.reviews || []).length === 0 && (
              <p className="font-body text-white/40">No reviews yet. Be the first.</p>
            )}
            {(p.reviews || []).map((r) => (
              <div key={r.id} className="border-b border-white/5 pb-5">
                <StarRating rating={r.rating} showCount={false} size={13} />
                <h4 className="mt-2 font-head font-medium">{r.title}</h4>
                <p className="mt-1 font-body text-sm text-white/60">{r.body}</p>
                <p className="mt-2 font-body text-xs text-white/30">— {r.user_name}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
            <h3 className="font-head font-semibold">Write a review</h3>
            {!user && <p className="mt-2 font-body text-xs text-white/40">Sign in to submit a review.</p>}
            <form onSubmit={submitReview} className="mt-4 space-y-3">
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: +e.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
              <input
                placeholder="Title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none"
              />
              <textarea
                placeholder="Your thoughts…"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                required
                rows={3}
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none"
              />
              <button
                type="submit"
                data-testid="submit-review"
                className="w-full rounded-full bg-white py-2.5 font-head text-sm font-semibold text-black"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related */}
      {p.related?.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-head text-2xl font-semibold">You might also like</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {p.related.map((rp, i) => (
              <ProductCard key={rp.slug} product={rp} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
