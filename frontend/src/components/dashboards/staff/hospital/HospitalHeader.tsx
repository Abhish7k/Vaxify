import { PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HospitalHeaderProps {
  name: string;
  status: string;
  onEditClick: () => void;
}

export const HospitalHeader = ({
  name,
  status,
  onEditClick,
}: HospitalHeaderProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-500 bg-amber-50"
          >
            Pending Approval
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 transition-all">
        <img
          src="https://ik.imagekit.io/vaxify/icons/hospital-2.png"
          alt=""
          className="size-24"
          draggable={false}
        />

        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight transition-all text-slate-900 dark:text-white">
            {name || "My Hospital"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your vaccination center's information and status.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge(status)}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 active:scale-95 transition-all shadow-sm"
          onClick={onEditClick}
        >
          <PenLine className="h-4 w-4" />
          Update Details
        </Button>
      </div>
    </div>
  );
};
