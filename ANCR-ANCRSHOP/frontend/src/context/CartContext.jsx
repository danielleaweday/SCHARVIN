import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";

const CartContext = createContext(null);
const KEY = "ancrshop_cart";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [coupon, setCoupon] = useState("");
  const debounce = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const refreshQuote = useCallback(
    (couponCode) => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(async () => {
        if (items.length === 0) {
          setQuote(null);
          return;
        }
        try {
          const { data } = await api.post("/cart/quote", {
            items: items.map((i) => ({ slug: i.slug, quantity: i.quantity, variant: i.variant })),
            coupon_code: couponCode ?? coupon ?? null,
          });
          setQuote(data);
        } catch {
          setQuote(null);
        }
      }, 250);
    },
    [items, coupon]
  );

  useEffect(() => {
    refreshQuote();
  }, [items, refreshQuote]);

  const addItem = (product, quantity = 1, variant = null) => {
    setItems((prev) => {
      const key = product.slug + JSON.stringify(variant || {});
      const existing = prev.find((i) => i.slug + JSON.stringify(i.variant || {}) === key);
      if (existing) {
        return prev.map((i) =>
          i.slug + JSON.stringify(i.variant || {}) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          icon: product.icon,
          accent: product.accent,
          is_digital: product.is_digital,
          quantity,
          variant,
        },
      ];
    });
    setDrawerOpen(true);
  };

  const updateQty = (idx, quantity) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, quantity) } : it))
    );
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const clear = () => {
    setItems([]);
    setQuote(null);
    setCoupon("");
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        quote,
        coupon,
        setCoupon,
        addItem,
        updateQty,
        removeItem,
        clear,
        drawerOpen,
        setDrawerOpen,
        refreshQuote,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
