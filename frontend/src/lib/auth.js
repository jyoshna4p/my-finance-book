import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("mfb_token");
    if (!t) { setLoading(false); return; }
    fetchMe()
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem("mfb_token"))
      .finally(() => setLoading(false));
  }, []);

  const doLogout = () => { localStorage.removeItem("mfb_token"); setUser(null); };
  const setSession = (token, u) => { localStorage.setItem("mfb_token", token); setUser(u); };

  return <Ctx.Provider value={{ user, setSession, doLogout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
