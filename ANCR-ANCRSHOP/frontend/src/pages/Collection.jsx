import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";

export default function Collection() {
  const { slug } = useParams();
  const [col, setCol] = useState(null);

  useEffect(() => {
    api.get(`/collections/${slug}`).then((r) => setCol(r.data)).catch(() => setCol(false));
  }, [slug]);

  if (col === false)
    return <div className="py-32 text-center font-head text-xl text-white/60">Collection not found</div>;

  return (
    <div>
      <section className="noise relative overflow-hidden border-b border-white/10">
        <PlaceholderMedia icon="Sparkles" accent={col?.accent || "a"} className="absolute inset-0 h-full w-full" iconClassName="!size-48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        <div className="relative mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-white/50">
            {col?.type === "drop" ? "Limited Drop" : "Collection"}
          </p>
          <h1 className="font-display text-4xl font-medium leading-tight md:text-7xl">
            {col?.title || "Loading…"}
          </h1>
          <p className="mt-4 font-body text-lg font-light text-white/60">{col?.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {(col?.products || []).map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
