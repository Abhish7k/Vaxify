import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment } from "./MyAppointmentsListSection";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import CancelAppointmentDialog from "./CancelAppointmentDialog";

export default function AppointmentCard({
  appointment,
  onViewCenter,
  onCancel,
}: Props) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium">{appointment.centerName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {appointment.centerAddress}
            </div>
          </div>

          <AppointmentStatusBadge status={appointment.status} />
        </div>

        {/* details */}
        <div className="grid gap-2 text-sm mt-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.timeSlot}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Vaccine:</span>{" "}
            {appointment.vaccine}
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between mt-5">
          <Button
            variant="link"
            className="px-0 cursor-pointer"
            onClick={onViewCenter}
          >
            View center
          </Button>

          {appointment.status === "BOOKED" && (
            <CancelAppointmentDialog
              centerName={appointment.centerName}
              onConfirm={onCancel}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type Props = {
  appointment: Appointment;
  onViewCenter: () => void;
  onCancel: () => void;
};
