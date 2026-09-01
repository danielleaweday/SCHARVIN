import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "cynaiah_token";

export const setToken = (t) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
};
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error?.response?.status === 401) {
            setToken(null);
            if (!window.location.pathname.startsWith("/auth")) {
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    },
);

// Resolve backend-relative asset URLs (e.g. /api/generated/xxx.png,
// /api/music-audio/xxx.mp3, /api/finish/video/xxx.mp4) and append the
// caller's bearer token as a `?token=<jwt>` query param.
//
// HTML5 `<img>`, `<audio>`, and `<video>` tags cannot attach an Authorization
// header, so the backend accepts the same JWT via query param on
// /api/generated/, /api/music-audio/, and /api/finish/video/. This helper
// centralises that so every existing usage of `resolveAssetUrl` gets auth
// for free.
const AUTH_MEDIA_PATHS = ["/api/generated/", "/api/music-audio/", "/api/finish/video/"];

export const resolveAssetUrl = (u) => {
    if (!u) return u;
    if (u.startsWith("http")) return u;
    if (!u.startsWith("/api/")) return u;
    const full = `${BACKEND_URL}${u}`;
    if (!AUTH_MEDIA_PATHS.some((p) => u.startsWith(p))) return full;
    const t = getToken();
    if (!t) return full;
    return `${full}${u.includes("?") ? "&" : "?"}token=${encodeURIComponent(t)}`;
};
