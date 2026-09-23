import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Hospital,
  Users,
  BarChart,
  MessageCircle,
} from "lucide-react";

export const USER_NAV_DROPDOWN_ITEMS = {
  user: [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "My Appointments",
      href: "/appointments",
      icon: CalendarCheck,
    },
    {
      name: "AI Assistant",
      href: "/assistant",
      icon: MessageCircle,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ],

  staff: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Center",
      href: "/staff/hospital",
      icon: Hospital,
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: User,
    },
  ],

  admin: [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Hospitals",
      href: "/admin/hospitals",
      icon: Hospital,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
    },
  ],
} as const;
