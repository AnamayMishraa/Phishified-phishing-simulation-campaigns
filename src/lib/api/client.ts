export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TOKEN_REFRESH_URL = `${API_URL}/auth/refresh/`;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setAuthCookie(value: string, maxAge: number): void {
  document.cookie = `access_token=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export function isTokenCookieSet(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("access_token="));
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem("access_token", access);
  setAuthCookie(access, 86400);
  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  clearAuthCookie();
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(TOKEN_REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const data = await res.json();
  setTokens(data.access);
  return data.access;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | undefined>;
  skipAuth?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, skipAuth = false } = options;

  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let accessToken = getAccessToken();
  if (accessToken && !skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const doFetch = (token?: string): Promise<Response> => {
    const h = { ...headers };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return fetch(url.toString(), {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // Attempt token refresh on 401
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = { detail: res.statusText };
    }
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  if (err instanceof ApiError) {
    const body = err.body;
    if (typeof body === "string") return body;
    if (body && typeof body === "object") {
      const obj = body as Record<string, unknown>;
      if (typeof obj.detail === "string") return obj.detail;
      if (Array.isArray(obj.non_field_errors)) {
        return obj.non_field_errors.join("; ");
      }
      try {
        return JSON.stringify(obj);
      } catch {
        return fallback;
      }
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
