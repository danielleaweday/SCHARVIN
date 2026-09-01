import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setBearer } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If returning from Emergent OAuth callback, skip /me — let AuthCallback handle it first.
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setBearer(data.session_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setBearer(data.session_token);
    setUser(data.user);
    return data.user;
  };

  const demoLogin = async (email) => {
    const { data } = await api.post("/auth/demo", { email });
    setBearer(data.session_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setBearer(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, demoLogin, logout, refresh: checkAuth, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
