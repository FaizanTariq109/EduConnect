"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/lib/client-api";
import type { User } from "@/lib/types";
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  reload: () => Promise<void>;
}>({ user: null, loading: true, reload: async () => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      setUser((await api<{ user: User }>("auth")).user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return (
    <AuthContext.Provider value={{ user, loading, reload }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
