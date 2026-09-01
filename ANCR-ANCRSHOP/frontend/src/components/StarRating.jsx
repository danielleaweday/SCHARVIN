import { Star } from "lucide-react";

export default function StarRating({ rating = 0, count, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? "fill-[#0a44ff] text-[#0a44ff]" : "text-white/20"}
          />
        ))}
      </div>
      {showCount && (
        <span className="font-body text-xs text-white/50">
          {rating?.toFixed(1)}
          {count != null ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
