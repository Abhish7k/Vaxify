import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppointmentStatus } from "@/types/appointment";

type Props = {
  status: AppointmentStatus;
  onBrowseCenters?: () => void;
};

export default function EmptyAppointmentsState({
  status,
  onBrowseCenters,
}: Props) {
  const copy: Record<
    AppointmentStatus,
    { title: string; description: string }
  > = {
    UPCOMING: {
      title: "No upcoming appointments",
      description: "You don’t have any upcoming vaccination appointments.",
    },
    scheduled: {
      title: "No upcoming appointments",
      description: "You don’t have any upcoming vaccination appointments.",
    },
    completed: {
      title: "No completed appointments",
      description: "You haven’t completed any appointments yet.",
    },
    cancelled: {
      title: "No cancelled appointments",
      description: "You don’t have any cancelled appointments.",
    },
    BOOKED: {
      title: "No upcoming appointments",
      description: "You don’t have any upcoming vaccination appointments.",
    },
    COMPLETED: {
      title: "No completed appointments",
      description: "You haven’t completed any appointments yet.",
    },
    CANCELLED: {
      title: "No cancelled appointments",
      description: "You don’t have any cancelled appointments.",
    },
  };

  return (
    <Card className="shadow-none border-none">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <CalendarX className="h-8 w-8 text-muted-foreground" />

        <h3 className="font-medium">{copy[status]?.title}</h3>

        <p className="text-sm text-muted-foreground max-w-sm">
          {copy[status]?.description}
        </p>

        {status === "BOOKED" && onBrowseCenters && (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={onBrowseCenters}
          >
            Browse centers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
