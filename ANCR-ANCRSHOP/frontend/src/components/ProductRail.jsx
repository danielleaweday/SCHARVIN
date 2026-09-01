import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function ProductRail({ title, subtitle, products = [], viewAll }) {
  if (!products.length) return null;
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            {subtitle && (
              <p className="mb-2 font-body text-xs uppercase tracking-[0.22em] text-white/40">
                {subtitle}
              </p>
            )}
            <h2 className="font-head text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {title}
            </h2>
          </div>
          {viewAll && (
            <Link
              to={viewAll}
              className="group hidden items-center gap-2 font-body text-sm text-white/60 transition-colors hover:text-white md:flex"
              data-testid={`rail-viewall-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              View all
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p, i) => (
            <div key={p.slug} className="min-w-[70vw] sm:min-w-[42vw] md:min-w-0">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
