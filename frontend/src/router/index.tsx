import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import AuthLayout from "@/components/auth/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import DashboardLayout from "@/components/dashboards/DashboardLayout";

// lazy loaded components
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const RegisterUser = lazy(() => import("@/pages/auth/RegisterUser"));
const RegisterStaff = lazy(() => import("@/pages/auth/RegisterStaff"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const StaffDashboard = lazy(() => import("@/pages/staff/StaffDashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const CenterDetailsPage = lazy(() => import("@/pages/centers/CenterDetailsPage"));
const AppointmentBookingPage = lazy(() => import("@/pages/appointment/book/AppointmentBookingPage"));
const BookingSummaryPage = lazy(() => import("@/pages/appointment/book/BookingSummaryPage"));
const BookingSuccessPage = lazy(() => import("@/pages/appointment/book/BookingSuccessPage"));
const MyAppointmentsPage = lazy(() => import("@/pages/appointment/MyAppointmentsPage"));
const StaffAppointmentsPage = lazy(() => import("@/pages/staff/StaffAppointmentsPage"));
const AdminHospitalsPage = lazy(() => import("@/pages/admin/AdminHospitalsPage"));
const AdminHospitalDetailsPage = lazy(() => import("@/pages/admin/AdminHospitalDetailsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminProfilePage = lazy(() => import("@/pages/admin/AdminProfilePage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalyticsPage"));
const UserProfilePage = lazy(() => import("@/pages/user/UserProfilePage"));
const StaffProfilePage = lazy(() => import("@/pages/staff/StaffProfilePage"));
const StaffVaccinesPage = lazy(() => import("@/pages/staff/StaffVaccinesPage"));
const StaffSlotsPage = lazy(() => import("@/pages/staff/StaffSlotsPage"));
const LowStockAlertsPage = lazy(() => import("@/pages/staff/LowStockAlertsPage"));
const MyHospitalPage = lazy(() => import("@/pages/staff/MyHospitalPage"));

import HomePage from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import CentersPage from "@/pages/CentersPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        handle: { title: "Home" },
      },
      {
        path: "/centers",
        element: <CentersPage />,
        handle: { title: "Centers" },
      },
      {
        path: "/centers/:centerId",
        element: <CenterDetailsPage />,
        handle: { title: "Center details" },
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
            handle: { title: "Login" },
          },
          {
            path: "/register",
            element: <RegisterPage />,
            handle: { title: "Register" },
          },
          {
            path: "/register/user",
            element: <RegisterUser />,
            handle: { title: "Register as user" },
          },
          {
            path: "/register/staff",
            element: <RegisterStaff />,
            handle: { title: "Register as staff" },
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
            handle: { title: "Dashboard" },
          },
          {
            path: "/appointments",
            element: <MyAppointmentsPage />,
            handle: { title: "My appointments" },
          },
          {
            path: "/profile",
            element: <UserProfilePage />,
            handle: { title: "Profile" },
          },
        ],
      },
      {
        element: <App />,
        children: [
          {
            path: "/appointments/book/:centerId",
            element: <AppointmentBookingPage />,
            handle: { title: "Book appointment" },
          },
          {
            path: "/appointments/book/summary",
            element: <BookingSummaryPage />,
            handle: { title: "Booking summary" },
          },
          {
            path: "/appointments/book/success",
            element: <BookingSuccessPage />,
            handle: { title: "Booking confirmed" },
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
            handle: { title: "Staff dashboard" },
          },
          {
            path: "/staff/profile",
            element: <StaffProfilePage />,
            handle: { title: "Staff profile" },
          },
          {
            path: "/staff/appointments",
            element: <StaffAppointmentsPage />,
            handle: { title: "Staff appointments" },
          },
          {
            path: "/staff/vaccines",
            element: <StaffVaccinesPage />,
            handle: { title: "Vaccines" },
          },
          {
            path: "/staff/slots",
            element: <StaffSlotsPage />,
            handle: { title: "Slots" },
          },
          {
            path: "/staff/alerts",
            element: <LowStockAlertsPage />,
            handle: { title: "Low stock alerts" },
          },
          {
            path: "/staff/hospital",
            element: <MyHospitalPage />,
            handle: { title: "My hospital" },
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
            handle: { title: "Admin dashboard" },
          },

          {
            path: "/admin/hospitals",
            element: <AdminHospitalsPage />,
            handle: { title: "Hospitals" },
          },
          {
            path: "/admin/hospitals/:hospitalId",
            element: <AdminHospitalDetailsPage />,
            handle: { title: "Hospital details" },
          },
          {
            path: "/admin/users",
            element: <AdminUsersPage />,
            handle: { title: "Users" },
          },
          {
            path: "/admin/analytics",
            element: <AdminAnalyticsPage />,
            handle: { title: "Analytics" },
          },
          {
            path: "/admin/profile",
            element: <AdminProfilePage />,
            handle: { title: "Admin profile" },
          },
        ],
      },
    ],
  },

  // fallback
  { path: "*", element: <NotFoundPage />, handle: { title: "Page not found" } },
]);
