import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import AuthLayout from "@/components/auth/AuthLayout";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import RegisterUser from "@/pages/auth/RegisterUser";
import RegisterStaff from "@/pages/auth/RegisterStaff";
import { ProtectedRoute } from "./ProtectedRoute";
import UserDashboard from "@/pages/user/UserDashboard";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import StaffDashboard from "@/pages/staff/StaffDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  // for auth
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/register/user",
        element: <RegisterUser />,
      },
      {
        path: "/register/staff",
        element: <RegisterStaff />,
      },
    ],
  },

  // user pages
  {
    element: <ProtectedRoute allowedRoles={["user"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <UserDashboard />,
          },
        ],
      },
    ],
  },

  // staff pages
  {
    element: <ProtectedRoute allowedRoles={["staff"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/staff/dashboard",
            element: <StaffDashboard />,
          },
        ],
      },
    ],
  },

  // fallback
  { path: "*", element: <NotFoundPage /> },
]);
