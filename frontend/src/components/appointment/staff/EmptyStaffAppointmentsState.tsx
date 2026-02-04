import { CalendarX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StaffAppointmentStatus } from "./StaffAppointmentsTabsSection";

type Props = {
  status: StaffAppointmentStatus;
};

export default function EmptyStaffAppointmentsState({ status }: Props) {
  return (
    <Card className="mt-10 border-none shadow-none">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <CalendarX className="h-8 w-8 text-muted-foreground" />

        <h3 className="font-medium">{copy[status]?.title}</h3>

        <p className="text-sm text-muted-foreground max-w-sm">
          {copy[status]?.description}
        </p>
      </CardContent>
    </Card>
  );
}

const copy: Record<
  StaffAppointmentStatus,
  { title: string; description: string }
> = {
  UPCOMING: {
    title: "No upcoming appointments",
    description: "There are no upcoming vaccination appointments scheduled.",
  },
  scheduled: {
    title: "No upcoming appointments",
    description: "There are no upcoming vaccination appointments scheduled.",
  },
  BOOKED: {
    title: "No upcoming appointments",
    description: "There are no upcoming vaccination appointments scheduled.",
  },
  COMPLETED: {
    title: "No completed appointments",
    description: "No appointments have been completed yet.",
  },
  completed: {
    title: "No completed appointments",
    description: "No appointments have been completed yet.",
  },
  CANCELLED: {
    title: "No cancelled appointments",
    description: "There are no cancelled appointments.",
  },
  cancelled: {
    title: "No cancelled appointments",
    description: "There are no cancelled appointments.",
  },
};
