import { createContext, useCallback, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false since we aren't waiting for a server anymore

  // Custom login function for your specific credentials
  const login = useCallback(async (email, password) => {
    if (email === "jyoshna4p@gmail.com" && password === "Jyoshna@20") {
      const mockUser = { email: email, name: "Jyoshna" };
      setUser(mockUser);
      return mockUser;
    }
    throw new Error("Invalid credentials");
  }, []);

  const doLogout = useCallback(async () => {
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    // Keep session alive in UI memory if needed
    setLoading(false);
  }, []);

  return (
    <Ctx.Provider value={{ user, login, doLogout, loading, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
