import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import RegisterUser from "@/pages/auth/RegisterUser";
import RegisterStaff from "@/pages/auth/RegisterStaff";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import UserDashboard from "@/pages/user/UserDashboard";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import HomePage from "@/pages/HomePage";
import CentersPage from "@/pages/CentersPage";
import CenterDetailsPage from "@/components/centers/center-details/CenterDetailsPage";
import AppointmentBookingPage from "@/pages/appointment/book/AppointmentBookingPage";
import BookingSummaryPage from "@/pages/appointment/book/BookingSummaryPage";
import BookingSuccessPage from "@/pages/appointment/book/BookingSuccessPage";
import MyAppointmentsPage from "@/pages/appointment/MyAppointmentsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import StaffAppointmentsPage from "@/pages/staff/StaffAppointmentsPage";
import AdminHospitalsPage from "@/pages/admin/AdminHospitalsPage";
import AdminHospitalDetailsPage from "@/pages/admin/AdminHospitalDetailsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminProfilePage from "@/pages/admin/AdminProfile";
import UserProfilePage from "@/pages/user/UserProfilePage";
import StaffProfilePage from "@/pages/staff/StaffProfilePage";
import StaffVaccinesPage from "@/pages/staff/StaffVaccinesPage";
import LowStockAlertsPage from "@/pages/staff/LowStockAlertsPage";
import MyHospitalPage from "@/pages/staff/MyHospitalPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "centers",
        element: <CentersPage />,
      },
      {
        path: "/centers/:centerId",
        element: <CenterDetailsPage />,
      },
      {
        path: "/about",
        element: <AboutUsPage />,
      },
    ],
  },

  // for auth
  {
    element: <PublicRoute />,
    children: [
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
          {
            path: "/appointments",
            element: <MyAppointmentsPage />,
          },
          {
            path: "/profile",
            element: <UserProfilePage />,
          },
        ],
      },
      {
        element: <App />,
        children: [
          {
            path: "/appointments/book/:centerId",
            element: <AppointmentBookingPage />,
          },
          {
            path: "/appointments/book/summary",
            element: <BookingSummaryPage />,
          },
          {
            path: "/appointments/book/success",
            element: <BookingSuccessPage />,
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
          {
            path: "/staff/profile",
            element: <StaffProfilePage />,
          },
          {
            path: "/staff/appointments",
            element: <StaffAppointmentsPage />,
          },
          {
            path: "/staff/vaccines",
            element: <StaffVaccinesPage />,
          },
          {
            path: "/staff/alerts",
            element: <LowStockAlertsPage />,
          },
          {
            path: "/staff/hospital",
            element: <MyHospitalPage />,
          },
        ],
      },
    ],
  },

  // admin pages
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },

          {
            path: "/admin/hospitals",
            element: <AdminHospitalsPage />,
          },
          {
            path: "/admin/hospitals/:hospitalId",
            element: <AdminHospitalDetailsPage />,
          },
          {
            path: "/admin/users",
            element: <AdminUsersPage />,
          },
          {
            path: "/admin/profile",
            element: <AdminProfilePage />,
          },
        ],
      },
    ],
  },

  // fallback
  { path: "*", element: <NotFoundPage /> },
]);
