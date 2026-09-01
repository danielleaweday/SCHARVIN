import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { storeApi, getToken, setToken } from "../lib/storeApi";

const StoreContext = createContext(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

const CART_KEY = "ccdp-cart";
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const StoreProvider = ({ children }) => {
  const [catalog, setCatalog] = useState({ collections: [], products: [], types: [] });
  const [cart, setCart] = useState(loadCart);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const productsById = useMemo(() => {
    const m = {};
    (catalog.products || []).forEach((p) => (m[p.id] = p));
    return m;
  }, [catalog.products]);

  useEffect(() => {
    storeApi.get("/catalog").then((r) => setCatalog(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const r = await storeApi.get("/auth/me");
      setUser(r.data.user);
    } catch {
      setToken("");
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Handle Google Sign-In redirect: exchange session_id from the URL fragment.
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.includes("session_id=")) {
      const sid = new URLSearchParams(hash.replace(/^#/, "")).get("session_id");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (sid) {
        storeApi
          .post("/auth/google", { session_id: sid })
          .then((r) => {
            setToken(r.data.token);
            setUser(r.data.user);
            setAuthLoading(false);
            toast.success(`Welcome, ${r.data.user.name || "creator"}.`);
          })
          .catch(() => {
            toast.error("Google sign-in failed. Please try again.");
            refreshUser();
          });
        return;
      }
    }
    refreshUser();
  }, [refreshUser]);

  const persistAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
  };

  const register = useCallback(async (payload) => {
    const r = await storeApi.post("/auth/register", payload);
    persistAuth(r.data);
    return r.data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const r = await storeApi.post("/auth/login", payload);
    persistAuth(r.data);
    return r.data.user;
  }, []);

  const loginWithGoogle = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/store/account";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  const cartKey = (id, size) => `${id}::${size}`;

  const addToCart = useCallback((productId, size = "One Size", quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => cartKey(c.productId, c.size) === cartKey(productId, size));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(25, next[idx].quantity + quantity) };
        return next;
      }
      return [...prev, { productId, size, quantity }];
    });
    toast.success("Added to cart");
  }, []);

  const updateQty = useCallback((productId, size, quantity) => {
    setCart((prev) =>
      prev
        .map((c) =>
          cartKey(c.productId, c.size) === cartKey(productId, size)
            ? { ...c, quantity: Math.max(1, Math.min(25, quantity)) }
            : c
        )
    );
  }, []);

  const removeFromCart = useCallback((productId, size) => {
    setCart((prev) => prev.filter((c) => cartKey(c.productId, c.size) !== cartKey(productId, size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = productsById[c.productId];
    return sum + (p ? p.price * c.quantity : 0);
  }, 0);

  const cartDetailed = cart
    .map((c) => ({ ...c, product: productsById[c.productId] }))
    .filter((c) => c.product);

  const toggleWishlist = useCallback(async (productId) => {
    if (!getToken()) {
      toast.error("Sign in to save favorites.");
      return;
    }
    try {
      const r = await storeApi.post(`/wishlist/${productId}`);
      setUser((u) => (u ? { ...u, wishlist: r.data.wishlist } : u));
    } catch {
      toast.error("Could not update favorites.");
    }
  }, []);

  const value = {
    catalog,
    productsById,
    cart,
    cartDetailed,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    user,
    authLoading,
    register,
    login,
    loginWithGoogle,
    logout,
    refreshUser,
    toggleWishlist,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
