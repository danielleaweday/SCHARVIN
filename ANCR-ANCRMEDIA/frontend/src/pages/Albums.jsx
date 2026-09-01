import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AlbumCard } from "@/components/MediaCards";

export default function Albums() {
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState("release_date");
  useEffect(() => { api.get(`/albums?sort=${sort}&limit=48`).then((r) => setItems(r.data)); }, [sort]);
  return (
    <div className="px-8 py-10 pb-24" data-testid="albums-page">
      <div className="mb-6">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Albums</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">The catalog.</h1>
      </div>
      <div className="flex gap-2 mb-6">
        <button data-testid="sort-new" onClick={() => setSort("release_date")} className={`px-4 py-2 rounded-full text-[12px] font-sans-alt ${sort === "release_date" ? "bg-white text-black" : "glass glass-hover"}`}>Newest</button>
        <button data-testid="sort-streams" onClick={() => setSort("streams")} className={`px-4 py-2 rounded-full text-[12px] font-sans-alt ${sort === "streams" ? "bg-white text-black" : "glass glass-hover"}`}>Most streamed</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map((a) => <AlbumCard key={a.id} album={a} />)}
      </div>
    </div>
  );
}
