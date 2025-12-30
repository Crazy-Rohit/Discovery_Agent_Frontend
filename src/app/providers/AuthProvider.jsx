import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, meApi } from "../../features/auth/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    if (!token) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const user = await meApi();
      setMe(user);
    } catch (e) {
      // token invalid
      localStorage.removeItem("token");
      setToken("");
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(username, password) {
    const data = await loginApi({ username, password });
    const t = data?.token || data?.access_token;
    if (!t) throw new Error("Token missing from login response");

    localStorage.setItem("token", t);
    setToken(t);
    setMe(data?.profile || null);
    return t;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  }

  const value = useMemo(
    () => ({ token, me, loading, login, logout, refreshMe }),
    [token, me, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
