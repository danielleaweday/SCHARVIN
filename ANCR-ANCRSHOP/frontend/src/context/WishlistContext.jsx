import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WishlistContext = createContext(null);
const KEY = "ancrshop_wishlist";

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  }, [slugs]);

  useEffect(() => {
    if (user) {
      api
        .get("/wishlist")
        .then((res) => {
          const serverSlugs = res.data.map((p) => p.slug);
          setSlugs((prev) => Array.from(new Set([...prev, ...serverSlugs])));
        })
        .catch(() => {});
    }
  }, [user]);

  const toggle = (slug) => {
    setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    if (user) api.post(`/wishlist/${slug}`).catch(() => {});
  };

  const has = (slug) => slugs.includes(slug);

  return (
    <WishlistContext.Provider value={{ slugs, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
