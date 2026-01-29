import {
  LayoutDashboard,
  Hospital,
  Calendar,
  Users,
  BarChart,
  User,
  CalendarPlus,
  Syringe,
  AlertTriangle,
  // Settings,
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
          path: "/centers",
          icon: CalendarPlus,
        },
        {
          label: "My Appointments",
          path: "/appointments",
          icon: Calendar,
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
        // {
        //   label: "Settings",
        //   path: "/settings",
        //   icon: Settings,
        // },
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
          label: "Vaccines",
          path: "/staff/vaccines",
          icon: Syringe,
        },
        {
          label: "All Appointments",
          path: "/staff/appointments",
          icon: Calendar,
        },
        {
          label: "Stock Alerts",
          path: "/staff/alerts",
          icon: AlertTriangle,
        },
        {
          label: "My Hospital",
          path: "/staff/hospital",
          icon: Hospital,
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
        // {
        //   label: "Settings",
        //   path: "/staff/settings",
        //   icon: Settings,
        // },
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
