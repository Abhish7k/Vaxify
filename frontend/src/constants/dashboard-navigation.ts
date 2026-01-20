import {
  LayoutDashboard,
  Hospital,
  Calendar,
  Users,
  BarChart,
  User,
  CalendarPlus,
  FileText,
  ShieldCheck,
  Settings,
  HelpCircle,
} from "lucide-react";

export const DashboardRoleBasedNavigationLinks = {
  user: [
    {
      group: "Main",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Book Appointment",
          path: "/appointments/book",
          icon: CalendarPlus,
        },
        {
          label: "My Appointments",
          path: "/my-appointments",
          icon: Calendar,
        },
        {
          label: "Vaccination Centers",
          path: "/centers",
          icon: Hospital,
        },
      ],
    },
    {
      group: "Records",
      items: [
        {
          label: "Vaccination History",
          path: "/records/history",
          icon: ShieldCheck,
        },
        {
          label: "Certificates",
          path: "/records/certificates",
          icon: FileText,
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          label: "Profile",
          path: "/profile",
          icon: User,
        },
        {
          label: "Settings",
          path: "/settings",
          icon: Settings,
        },
        {
          label: "Help & Support",
          path: "/support",
          icon: HelpCircle,
        },
      ],
    },
  ],

  staff: [
    {
      group: "Main",
      items: [
        {
          label: "Dashboard",
          path: "/staff/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Manage Centers",
          path: "/staff/centers/manage",
          icon: Hospital,
        },
        {
          label: "All Appointments",
          path: "/staff/appointments",
          icon: Calendar,
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          label: "Profile",
          path: "/staff/profile",
          icon: User,
        },
        {
          label: "Settings",
          path: "/staff/settings",
          icon: Settings,
        },
        {
          label: "Help & Support",
          path: "/staff/support",
          icon: HelpCircle,
        },
      ],
    },
  ],

  admin: [
    {
      group: "Main",
      items: [
        {
          label: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Hospitals",
          path: "/admin/hospitals",
          icon: Hospital,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: Users,
        },
        {
          label: "Analytics",
          path: "/admin/analytics",
          icon: BarChart,
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          label: "Profile",
          path: "/admin/profile",
          icon: User,
        },
      ],
    },
  ],
} as const;
