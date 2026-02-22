import { useAuth } from "@/auth/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const role = user.role?.toLowerCase();

    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
