import { api, clearTokens, setTokens } from "./client";
import type { LoginRequest, LoginResponse, RefreshResponse, User } from "./types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const data = await api<LoginResponse>("/auth/login/", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });

  setTokens(data.access, data.refresh);
  return data;
}

export async function refresh(): Promise<string | null> {
  const raw = localStorage.getItem("refresh_token");
  if (!raw) return null;

  try {
    const data = await api<RefreshResponse>("/auth/refresh/", {
      method: "POST",
      body: { refresh: raw },
      skipAuth: true,
    });
    setTokens(data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function logout(): Promise<void> {
  const raw = localStorage.getItem("refresh_token");
  if (raw) {
    try {
      await api("/auth/logout/", {
        method: "POST",
        body: { refresh: raw },
        skipAuth: true,
      });
    } catch {
      // Swallow — tokens are cleared regardless
    }
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<User> {
  return api<User>("/auth/me/");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}
