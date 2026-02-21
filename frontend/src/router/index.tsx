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
const CenterDetailsPage = lazy(() => import("@/components/centers/center-details/CenterDetailsPage"));
const AppointmentBookingPage = lazy(() => import("@/pages/appointment/book/AppointmentBookingPage"));
const BookingSummaryPage = lazy(() => import("@/pages/appointment/book/BookingSummaryPage"));
const BookingSuccessPage = lazy(() => import("@/pages/appointment/book/BookingSuccessPage"));
const MyAppointmentsPage = lazy(() => import("@/pages/appointment/MyAppointmentsPage"));
const AboutUsPage = lazy(() => import("@/pages/AboutUsPage"));
const StaffAppointmentsPage = lazy(() => import("@/pages/staff/StaffAppointmentsPage"));
const AdminHospitalsPage = lazy(() => import("@/pages/admin/AdminHospitalsPage"));
const AdminHospitalDetailsPage = lazy(() => import("@/pages/admin/AdminHospitalDetailsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminProfilePage = lazy(() => import("@/pages/admin/AdminProfile"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalyticsPage"));
const UserProfilePage = lazy(() => import("@/pages/user/UserProfilePage"));
const StaffProfilePage = lazy(() => import("@/pages/staff/StaffProfilePage"));
const StaffVaccinesPage = lazy(() => import("@/pages/staff/StaffVaccinesPage"));
const StaffSlotsPage = lazy(() => import("@/pages/staff/StaffSlotsPage"));
const LowStockAlertsPage = lazy(() => import("@/pages/staff/LowStockAlertsPage"));
const MyHospitalPage = lazy(() => import("@/pages/staff/MyHospitalPage"));
const FAQsPage = lazy(() => import("@/pages/info/FAQsPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/info/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("@/pages/info/TermsOfServicePage"));

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
      {
        path: "/faqs",
        element: <FAQsPage />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfServicePage />,
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
            path: "/staff/slots",
            element: <StaffSlotsPage />,
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
            path: "/admin/analytics",
            element: <AdminAnalyticsPage />,
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
