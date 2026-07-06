export type StoredUser = {
  id: string;
  email: string;
  role: string;
};

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const ADMIN_KEY = "admin";

function canUseBrowserApis(): boolean {
  return typeof window !== "undefined";
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

function getJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = decodeBase64Url(parts[1]);
  if (!payload) return null;

  try {
    const parsed = JSON.parse(payload) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (!canUseBrowserApis()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseBrowserApis()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getApiBaseUrl(): string {
  if (!canUseBrowserApis()) return "http://localhost:8010";
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  return `${protocol}://${window.location.hostname}:8010`;
}

export function getStoredUser(): StoredUser | null {
  if (!canUseBrowserApis()) return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: StoredUser, refreshToken?: string): void {
  if (!canUseBrowserApis()) return;

  window.localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(ADMIN_KEY, user.role === "admin" ? "true" : "false");

  document.cookie = `bp_token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  document.cookie = `bp_role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax`;

  window.dispatchEvent(new Event("bp-auth-changed"));
}

export function clearAuth(): void {
  if (!canUseBrowserApis()) return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ADMIN_KEY);

  document.cookie = "bp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  document.cookie = "bp_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

  window.dispatchEvent(new Event("bp-auth-changed"));
}

export function isTokenExpired(token: string): boolean {
  const exp = getJwtExp(token);
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}