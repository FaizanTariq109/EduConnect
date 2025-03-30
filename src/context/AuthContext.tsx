"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { checkAuth } from "@/util/isAuth";

interface AuthState {
  auth: boolean;
  token: string;
  type: string;
}

interface AuthContextType {
  isAuth: AuthState;
  setIsAuth: (auth: boolean, token: string, type: string) => void;
}

const defState: AuthState = { auth: false, token: "", type: "" };

const AuthContext = createContext<AuthContextType>({
  isAuth: defState,
  setIsAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setAuthState] = useState<AuthState>(defState);
  const setIsAuth = (auth: boolean, token: string, type: string) => {
    setAuthState({ auth, token, type });
  };
  useEffect(() => {
    checkAuth(setIsAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
