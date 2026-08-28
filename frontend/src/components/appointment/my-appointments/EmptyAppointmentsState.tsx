import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserAppointmentTab } from "@/types/appointment";

type Props = {
  status: UserAppointmentTab;
  onBrowseCenters?: () => void;
};

export default function EmptyAppointmentsState({ status, onBrowseCenters }: Props) {
  const copy: Record<UserAppointmentTab, { title: string; description: string }> = {
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
    MISSED: {
      title: "No missed appointments",
      description: "You don't have any missed appointments.",
    },
  };

  return (
    <Card className="shadow-none border-none">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <CalendarX className="h-8 w-8 text-muted-foreground" />

        <h3 className="font-medium">{copy[status]?.title}</h3>

        <p className="text-sm text-muted-foreground max-w-sm">{copy[status]?.description}</p>

        {status === "BOOKED" && onBrowseCenters && (
          <Button variant="secondary" className="mt-4" onClick={onBrowseCenters}>
            Browse centers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
