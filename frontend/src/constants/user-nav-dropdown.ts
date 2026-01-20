import {
  LayoutDashboard,
  User,
  CalendarCheck,
  PlusCircle,
  Hospital,
  Users,
  BarChart,
} from "lucide-react";

export const USER_NAV_DROPDOWN_ITEMS = {
  user: [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "My Appointments",
      href: "/appointments",
      icon: CalendarCheck,
    },
    {
      name: "Book Appointment",
      href: "/appointments/book",
      icon: PlusCircle,
    },
  ],

  staff: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: User,
    },
    {
      name: "Manage Centers",
      href: "/staff/centers/manage",
      icon: Hospital,
    },
  ],

  admin: [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
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
  ],
} as const;
