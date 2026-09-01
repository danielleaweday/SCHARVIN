import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 12000 });

// Resilient retry: transient network errors / timeouts / 502-504 are retried
// with backoff. Preview proxies occasionally stall a fresh connection.
client.interceptors.response.use(undefined, async (error) => {
  const cfg = error.config || {};
  const status = error.response?.status;
  const retriable = !error.response || error.code === "ECONNABORTED" || [502, 503, 504].includes(status);
  cfg.__retry = cfg.__retry || 0;
  if (retriable && cfg.__retry < 3) {
    cfg.__retry += 1;
    await new Promise((r) => setTimeout(r, 400 * cfg.__retry));
    return client(cfg);
  }
  return Promise.reject(error);
});

export default client;
