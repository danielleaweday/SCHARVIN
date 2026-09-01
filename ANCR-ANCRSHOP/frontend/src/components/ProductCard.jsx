import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import StarRating from "@/components/StarRating";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);
  const soldOut = product.stock === 0;

  const badge = product.badges?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group relative"
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="hover-media relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/5">
          <PlaceholderMedia
            icon={product.icon}
            accent={product.accent}
            className="h-full w-full"
            label={product.brand}
          />
          {badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              {badge}
            </span>
          )}
          {soldOut && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 font-head text-[10px] uppercase tracking-[0.15em] text-white/70 backdrop-blur">
              Sold Out
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.slug);
            }}
            aria-label="Toggle wishlist"
            data-testid={`wishlist-toggle-${product.slug}`}
            className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur transition-all hover:bg-black/80"
          >
            <Heart size={15} className={wished ? "fill-[#ff2bd0] text-[#ff2bd0]" : "text-white/70"} />
          </button>
        </div>
      </Link>

      <div className="mt-4 space-y-1.5">
        <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/40">
          {product.category}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-head text-[15px] font-medium leading-snug text-white transition-colors group-hover:text-white/70">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} count={product.review_count} size={12} />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-head text-base text-white">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="font-body text-xs text-white/35 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product, 1)}
            disabled={soldOut}
            aria-label="Add to bag"
            data-testid={`quick-add-${product.slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a44ff] text-white transition-all hover:bg-[#0836cc] disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
