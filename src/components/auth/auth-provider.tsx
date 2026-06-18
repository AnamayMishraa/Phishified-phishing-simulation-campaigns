"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout as apiLogout } from "@/lib/api/auth";
import { clearTokens, isTokenCookieSet } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginRedirect: (path: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  const loginRedirect = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginRedirect,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
