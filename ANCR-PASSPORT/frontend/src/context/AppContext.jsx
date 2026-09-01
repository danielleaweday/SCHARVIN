import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textScale, setTextScale] = useState("normal");

  const loadUser = async () => {
    const { data } = await api.get("/me");
    setUser(data);
  };

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const map = { small: "15px", normal: "16px", large: "18px" };
    document.documentElement.style.fontSize = map[textScale] || "16px";
  }, [textScale]);

  const setRole = async (role) => {
    const { data } = await api.put("/me/role", { role });
    setUser(data);
  };

  return (
    <AppContext.Provider value={{ user, loading, loadUser, setRole, reducedMotion, setReducedMotion, textScale, setTextScale }}>
      {children}
    </AppContext.Provider>
  );
};
