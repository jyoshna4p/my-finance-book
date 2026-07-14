import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Auth is carried by an httpOnly cookie set by the backend.
// withCredentials: true is required so the browser sends `mfb_session` on every call.
export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const login = (email, password, remember) =>
  api.post("/auth/login", { email, password, remember }).then((r) => r.data);

export const logout = () => api.post("/auth/logout").then((r) => r.data);

export const fetchAllowlist = () => api.get("/auth/allowlist").then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);

export const aiSuggest = (prompt, provider = "anthropic", system) =>
  api.post("/ai/suggest", { prompt, provider, system }).then((r) => r.data);

export const savePortfolio = (holdings, watchlist) =>
  api.post("/portfolio/save", { holdings, watchlist }).then((r) => r.data);
export const getPortfolio = () => api.get("/portfolio").then((r) => r.data);
