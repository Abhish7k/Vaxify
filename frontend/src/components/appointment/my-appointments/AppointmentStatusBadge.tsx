import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types/appointment";
import type { StaffAppointmentStatus } from "../staff/StaffAppointmentsTabsSection";
import type { HospitalStatus } from "@/types/admin-hospital";

type Props = {
  status: AppointmentStatus | StaffAppointmentStatus | HospitalStatus;
};

export default function AppointmentStatusBadge({ status }: Props) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="border border-green-600/20 bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 ">
          Completed
        </Badge>
      );

    case "BOOKED":
      return (
        <Badge className="border border-blue-600/20 bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40">
          Booked
        </Badge>
      );

    case "CANCELLED":
      return (
        <Badge className="border border-destructive/50 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">
          Cancelled
        </Badge>
      );

    case "UPCOMING":
      return (
        <Badge className="border border-blue-600/20 bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40">
          Upcoming
        </Badge>
      );

    case "PENDING":
      return (
        <Badge className="border border-blue-600/20 bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40">
          Pending
        </Badge>
      );

    case "APPROVED":
      return (
        <Badge className="border border-green-600/20 bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 ">
          Approved
        </Badge>
      );

    case "REJECTED":
      return (
        <Badge className="border border-destructive/50 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">
          Cancelled
        </Badge>
      );

    default:
      return null;
  }
}
