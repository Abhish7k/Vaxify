import { useAuth } from "@/auth/useAuth";
import type { Role } from "@/types/auth";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // if user is not authenticated then redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // if user is authenticated but not authorized with the right role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const role = user.role?.toLowerCase();

    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    if (role === "user") {
      return <Navigate to="/dashboard" replace />;
    }

    // fallback for unknown roles - go to home to break loop
    return <Navigate to="/" replace />;
  }

  // render the child route component
  return <Outlet />;
};
