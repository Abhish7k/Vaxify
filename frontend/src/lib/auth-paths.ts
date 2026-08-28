import type { Role } from "@/types/auth";

export function getHomePath(role?: string | null): string {
  switch ((role ?? "").toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "user":
      return "/dashboard";
    default:
      return "/";
  }
}

export function isSafeAppPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

export function canAccessPath(role: Role, path: string): boolean {
  const pathname = path.split("?")[0];

  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/staff")) return role === "staff";
  if (pathname === "/dashboard" || pathname === "/profile" || pathname.startsWith("/appointments")) {
    return role === "user";
  }

  return true;
}

export function resolvePostLoginPath(role: Role, returnTo?: string | null): string {
  if (returnTo && isSafeAppPath(returnTo) && canAccessPath(role, returnTo)) {
    return returnTo;
  }

  return getHomePath(role);
}

export function getReturnToFromSearch(search: string): string | null {
  const next = new URLSearchParams(search).get("next");
  return next && isSafeAppPath(next) ? next : null;
}
