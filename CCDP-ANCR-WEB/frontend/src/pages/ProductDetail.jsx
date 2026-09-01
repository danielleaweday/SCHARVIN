import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Seo } from "../components/Seo";
import { useStore } from "../context/StoreProvider";
import { money } from "../lib/storeApi";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productsById, catalog, addToCart, toggleWishlist, user } = useStore();
  const product = productsById[id];
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  const related = useMemo(() => {
    if (!product) return [];
    return (catalog.products || [])
      .filter((p) => p.collectionId === product.collectionId && p.id !== product.id)
      .slice(0, 4);
  }, [catalog.products, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-ccdp-black">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-[128px] text-ccdp-cream/60">
          <p>Loading product…</p>
          <Link to="/store" className="text-gradient">Back to Store</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const chosenSize = size || (product.variants || []).find((v) => v.available)?.size || product.sizes[0];
  const saved = (user?.wishlist || []).includes(product.id);
  const variantBySize = Object.fromEntries((product.variants || []).map((v) => [v.size, v]));
  const chosenVariant = variantBySize[chosenSize];
  const chosenAvailable = chosenVariant ? chosenVariant.available : true;
  const chosenLow = chosenVariant?.lowStock;

  const handleAdd = (buyNow) => {
    if (!chosenAvailable) return;
    addToCart(product.id, chosenSize, qty);
    if (buyNow) navigate("/store/cart");
  };

  return (
    <div className="min-h-screen bg-ccdp-black">
      <Seo title={product.name} description={`${product.name} — ${product.blurb}`} />
      <Navbar />

      <section className="pt-[128px] md:pt-[150px]">
        <div className="mx-auto max-w-[1300px] px-5 md:px-10">
          <Link to="/store" data-testid="back-to-store" className="mb-8 inline-flex items-center gap-2 text-sm text-ccdp-cream/60 hover:text-ccdp-white">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
              <img data-testid="product-detail-image" src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: product.accent }}>{product.collectionName} · {product.category}</span>
              <h1 data-testid="product-detail-name" className="mt-3 font-display text-3xl font-semibold tracking-tight text-ccdp-white sm:text-4xl">{product.name}</h1>
              <p className="mt-4 text-2xl font-semibold text-ccdp-cream" data-testid="product-detail-price">{money(product.price)}</p>
              <p className="mt-5 text-base leading-relaxed text-ccdp-cream/70">{product.blurb}</p>

              <div className="mt-8">
                <p className="overline mb-3 text-ccdp-cream/50">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const v = variantBySize[s];
                    const unavailable = v ? !v.available : false;
                    return (
                      <button
                        key={s}
                        onClick={() => !unavailable && setSize(s)}
                        disabled={unavailable}
                        data-testid={`size-${s}`}
                        className={`min-w-[52px] rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                          unavailable
                            ? "cursor-not-allowed border-white/5 text-ccdp-cream/25 line-through"
                            : chosenSize === s
                            ? "border-transparent bg-ccdp-gradient text-white"
                            : "border-white/15 text-ccdp-cream/75 hover:border-white/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {chosenLow && chosenAvailable && (
                  <p data-testid="low-stock-note" className="mt-3 text-sm font-medium text-amber-400">Only {chosenVariant.stock} left in {chosenSize} — order soon.</p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-white/15">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="qty-minus" className="grid h-11 w-11 place-items-center text-ccdp-cream hover:text-ccdp-white"><Minus className="h-4 w-4" /></button>
                  <span data-testid="qty-value" className="w-8 text-center text-sm font-semibold text-ccdp-white">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(25, q + 1))} data-testid="qty-plus" className="grid h-11 w-11 place-items-center text-ccdp-cream hover:text-ccdp-white"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={() => toggleWishlist(product.id)} data-testid="detail-wishlist-btn" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-ccdp-cream hover:border-white/40">
                  <Heart className={`h-5 w-5 ${saved ? "fill-ccdp-magenta text-ccdp-magenta" : ""}`} />
                </button>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {product.soldOut ? (
                  <div data-testid="detail-sold-out" className="flex-1 rounded-full border border-white/10 bg-white/5 py-4 text-center text-sm font-semibold text-ccdp-cream/40">Sold Out</div>
                ) : (
                  <>
                    <button onClick={() => handleAdd(false)} disabled={!chosenAvailable} data-testid="add-to-cart-btn" className="flex-1 rounded-full border border-white/20 py-4 text-sm font-semibold text-ccdp-white transition-colors hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-40">{chosenAvailable ? "Add to Cart" : "Size Unavailable"}</button>
                    <button onClick={() => handleAdd(true)} disabled={!chosenAvailable} data-testid="buy-now-btn" className="flex-1 rounded-full bg-ccdp-gradient py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">Buy Now</button>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 text-sm text-ccdp-cream/55">
                <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" /> Ships worldwide · calculated at checkout</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl font-semibold text-ccdp-white">More from {product.collectionName}</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {related.map((p) => (
                  <Link key={p.id} to={`/store/product/${p.id}`} data-testid={`related-${p.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-ccdp-charcoal/40 transition-all hover:-translate-y-1 hover:border-white/25">
                    <div className="aspect-square overflow-hidden bg-black">
                      <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-ccdp-white">{p.name}</p>
                      <p className="mt-1 text-sm text-ccdp-cream/60">{money(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
