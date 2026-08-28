import type { AuthUser } from "@/types/auth";
import { clearAllBookingDrafts } from "@/lib/booking-draft";

export const TOKEN_KEY = "token";
export const USER_KEY = "storedUser";
export const AUTH_LOGOUT_EVENT = "auth:logout";

export function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function persistUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUserString() {
  return localStorage.getItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = getStoredUserString();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearAllBookingDrafts();
}

export function emitAuthLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

export function isAuthRequestUrl(url: string | undefined) {
  if (!url) return false;

  try {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    return path.startsWith("/auth/") || path.startsWith("/api/auth/");
  } catch {
    return url.startsWith("/auth/");
  }
}
