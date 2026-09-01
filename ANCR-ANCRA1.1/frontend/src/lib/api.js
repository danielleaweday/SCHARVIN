import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 25000,
});

/** Small helper: memoised GET returning `data` only. */
export async function get(path, params) {
  const { data } = await api.get(path, { params });
  return data;
}
