import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API } from "../lib/api";

const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

const TOKEN_KEY = "ccdp_admin_token";

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const authApi = axios.create({ baseURL: API });
  authApi.interceptors.request.use((cfg) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });

  useEffect(() => {
    if (!token) { setReady(true); return; }
    authApi.get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(""); })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(""); setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, user, ready, login, logout, authApi }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
