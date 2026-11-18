"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth";
import type { AuthUser, LoginResponse } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ userId: string; name: string; email: string; role: AuthUser["role"] }>("/auth/me");
      setUser({ id: data.userId, name: data.name, email: data.email, role: data.role });
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Restaura a sessão a partir do token salvo no cookie.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
      setToken(data.accessToken);
      setUser(data.user);
      toast.success(`Bem-vindo de volta, ${data.user.name.split(" ")[0]}!`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    toast.success("Sessão encerrada");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
