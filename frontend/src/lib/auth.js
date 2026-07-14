import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe, logout as apiLogout } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetchMe();
      setUser(r.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = useCallback((_token, u) => {
    // Session is now stored server-side in an httpOnly cookie.
    // We only track the user object in memory for UI.
    setUser(u);
  }, []);

  const doLogout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, setSession, doLogout, loading, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
