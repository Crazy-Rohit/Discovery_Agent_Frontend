import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../../services/storage/tokenStorage";
import { loginApi, meApi } from "../../features/auth/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStorage.get());
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!token) {
        setMe(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const profile = await meApi();
        if (mounted) setMe(profile);
      } catch (e) {
        tokenStorage.clear();
        if (mounted) {
          setToken(null);
          setMe(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMe();
    return () => { mounted = false; };
  }, [token]);

  const value = useMemo(() => ({
    token,
    me,
    loading,
    async login(username, password) {
      const data = await loginApi({ username, password });
      const t = data?.token || data?.access_token; // support both shapes
      tokenStorage.set(t);
      setToken(t);
      return t;
    },
    logout() {
      tokenStorage.clear();
      setToken(null);
      setMe(null);
    },
  }), [token, me, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
