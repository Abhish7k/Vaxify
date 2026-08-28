import { useAuth } from "@/auth/useAuth";
import { RouteSpinner } from "@/components/ui/route-spinner";
import { getReturnToFromSearch, resolvePostLoginPath } from "@/lib/auth-paths";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const PublicRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteSpinner />;
  }

  if (isAuthenticated && user) {
    const returnTo = getReturnToFromSearch(location.search);
    return <Navigate to={resolvePostLoginPath(user.role, returnTo)} replace />;
  }

  return <Outlet />;
};
