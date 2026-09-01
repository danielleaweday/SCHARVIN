import axios from "axios";

export const STORE_API = `${process.env.REACT_APP_BACKEND_URL}/api/store`;
export const storeApi = axios.create({ baseURL: STORE_API });

const TOKEN_KEY = "ccdp-store-token";
export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

storeApi.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
