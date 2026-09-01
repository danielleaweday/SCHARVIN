import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach bearer if we happen to have a session token (used only as fallback)
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("coheir_bearer");
  if (t && !cfg.headers?.Authorization) {
    cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${t}` };
  }
  return cfg;
});

export function setBearer(token) {
  if (token) localStorage.setItem("coheir_bearer", token);
  else localStorage.removeItem("coheir_bearer");
}
