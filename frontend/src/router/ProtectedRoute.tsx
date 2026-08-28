import { useAuth } from "@/auth/useAuth";
import { RouteSpinner } from "@/components/ui/route-spinner";
import { PageLoadError } from "@/components/ui/page-load-error";
import { getHomePath } from "@/lib/auth-paths";
import { getStoredToken } from "@/lib/auth-session";
import type { Role } from "@/types/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteSpinner />;
  }

  if (sessionError && !isAuthenticated && getStoredToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <PageLoadError
          message="Could not restore your session. Please try again."
          onRetry={retrySession}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
};
