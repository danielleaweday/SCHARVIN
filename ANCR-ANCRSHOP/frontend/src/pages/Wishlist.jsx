import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function Wishlist() {
  const { slugs } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    Promise.all(
      slugs.map((s) => api.get(`/products/${s}`).then((r) => r.data).catch(() => null))
    ).then((res) => {
      setProducts(res.filter(Boolean));
      setLoading(false);
    });
  }, [slugs]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
      <div className="mb-10 flex items-center gap-3">
        <Heart size={28} className="text-[#ff2bd0]" />
        <h1 className="font-display text-4xl font-medium md:text-5xl">Saved</h1>
      </div>
      {loading ? (
        <p className="font-body text-white/40">Loading…</p>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-head text-xl text-white/60">Your wishlist is empty</p>
          <Link to="/departments" className="mt-6 inline-block rounded-full bg-[#0a44ff] px-7 py-3.5 font-head text-sm text-white">
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
