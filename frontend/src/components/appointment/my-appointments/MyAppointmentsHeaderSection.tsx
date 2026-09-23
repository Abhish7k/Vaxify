import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, RefreshCcw } from "lucide-react";

type Props = {
  onRefresh: () => void;
  loading?: boolean;
};

export default function MyAppointmentsHeaderSection({
  onRefresh,
  loading,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">My Appointments</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your vaccination bookings
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        <Link to="/centers">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Book New
          </Button>
        </Link>
      </div>
    </div>
  );
}
