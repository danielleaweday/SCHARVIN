import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { Skeleton } from "@/components/ui/skeleton";

const DEPT_IMAGES = {
  "official-ancr-collections": "/brand/campaign-b.jpg",
  "ccdp-student-store": "/brand/campaign-a.jpg",
  "wellness-viearta": "/brand/campaign-viearta.png",
  "artist-merchandise": "/brand/campaign-d.jpg",
};

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["rating", "Top Rated"],
];

export default function Shop() {
  const { dept } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [dep, setDep] = useState(null);
  const [facets, setFacets] = useState({ categories: [], brands: [] });
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    if (dept) {
      api.get("/departments").then((r) => setDep(r.data.find((d) => d.slug === dept)));
      api.get(`/products/facets?department=${dept}`).then((r) => setFacets(r.data));
    } else {
      setDep(null);
      api.get(`/products/facets`).then((r) => setFacets(r.data));
    }
    setCategory("");
  }, [dept]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dept) params.set("department", dept);
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (maxPrice) params.set("max_price", maxPrice);
    if (inStock) params.set("in_stock", "true");
    params.set("sort", sort);
    params.set("limit", "48");
    api
      .get(`/products?${params.toString()}`)
      .then((r) => {
        setProducts(r.data.items);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [dept, q, category, maxPrice, inStock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const title = q ? `Results for "${q}"` : dep?.name || "All Products";
  const tagline = q ? `${total} products found` : dep?.tagline || "The full catalog";

  return (
    <div>
      {/* header banner */}
      <section className="noise relative overflow-hidden border-b border-white/10">
        <PlaceholderMedia
          icon={dep?.icon || "Store"}
          accent={dep?.accent || "a"}
          className="absolute inset-0 h-full w-full"
          iconClassName="!size-48"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-[#050505]/40" />
        <div className="relative mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-white/50">
            {q ? "Search" : "Marketplace"}
          </p>
          <h1 className="font-display text-4xl font-medium leading-tight md:text-6xl">{title}</h1>
          <p className="mt-3 font-body text-white/60">{tagline}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 py-8 md:px-10">
        {/* toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <button
            onClick={() => setShowFilters((s) => !s)}
            data-testid="filters-toggle"
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-head text-sm hover:border-white/40"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-white/40">{total} items</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              data-testid="sort-select"
              className="rounded-full border border-white/15 bg-[#0a0a0a] px-4 py-2 font-body text-sm text-white focus:outline-none"
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* filter sidebar */}
          {showFilters && (
            <aside className="w-56 shrink-0 space-y-6" data-testid="filter-panel">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-head text-sm font-semibold">Category</h3>
                  {category && (
                    <button onClick={() => setCategory("")} aria-label="Clear category">
                      <X size={14} className="text-white/40" />
                    </button>
                  )}
                </div>
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {facets.categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(category === c ? "" : c)}
                      className={`block w-full text-left font-body text-sm transition-colors ${
                        category === c ? "text-[#4d7cff]" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-head text-sm font-semibold">Max Price</h3>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={maxPrice || 2000}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-[#0a44ff]"
                />
                <p className="mt-1 font-body text-sm text-white/60">
                  Up to ${maxPrice || 2000}
                </p>
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="accent-[#0a44ff]"
                />
                In stock only
              </label>
            </aside>
          )}

          {/* grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-head text-xl text-white/60">No products found</p>
                <p className="mt-2 font-body text-sm text-white/40">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
