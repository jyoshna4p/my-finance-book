import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("mfb_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const login = (email, password, remember) =>
  api.post("/auth/login", { email, password, remember }).then((r) => r.data);

export const fetchAllowlist = () => api.get("/auth/allowlist").then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);

export const aiSuggest = (prompt, provider = "anthropic", system) =>
  api.post("/ai/suggest", { prompt, provider, system }).then((r) => r.data);

export const savePortfolio = (holdings, watchlist) =>
  api.post("/portfolio/save", { holdings, watchlist }).then((r) => r.data);
export const getPortfolio = () => api.get("/portfolio").then((r) => r.data);
