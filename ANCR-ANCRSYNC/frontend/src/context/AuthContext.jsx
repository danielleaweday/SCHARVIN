import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ancr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("ancr_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("ancr_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const signup = async (payload) => {
    const r = await api.post("/auth/signup", payload);
    localStorage.setItem("ancr_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const federated = async (source) => {
    // Demo SSO — provision or recognize an ANCRID linked to another product
    const seed = Math.random().toString(36).slice(2, 8);
    const payload = {
      source,
      email: `${source}-${seed}@ancrid.co`,
      display_name: `${source[0].toUpperCase() + source.slice(1)} Creator`,
      role: source === "ancra" ? "Student" : source === "inheira" ? "Publisher" : "Producer",
      discipline: source === "inheira" ? "Publishing" : source === "ancra" ? "Education" : "Music",
      city: "London",
      country: "United Kingdom",
    };
    const r = await api.post("/ancrid/federated", payload);
    localStorage.setItem("ancr_token", r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem("ancr_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, federated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
