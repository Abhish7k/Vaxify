import { Badge } from "@/components/ui/badge";
import type { HospitalStatus } from "@/types/admin-hospital";

type Props = {
  status: HospitalStatus;
};

export default function HospitalStatusBadge({ status }: Props) {
  switch (status) {
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
          Rejected
        </Badge>
      );

    default:
      return null;
  }
}
