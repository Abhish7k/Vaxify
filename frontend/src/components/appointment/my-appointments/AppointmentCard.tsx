import { Calendar, Clock, MapPin, Syringe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import CancelAppointmentDialog from "./CancelAppointmentDialog";
import type { Appointment } from "@/types/appointment";

type Props = {
  appointment: Appointment;
  onViewCenter: () => void;
  onCancel: () => void;
  onViewTicket: () => void;
};

export default function AppointmentCard({
  appointment,
  onViewCenter,
  onCancel,
  onViewTicket,
}: Props) {
  return (
    <div className="w-full">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="px-6">
          <div
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              items-center
              [@media(min-width:1100px)]:grid-cols-[1.6fr_1fr_1fr_1fr_auto]
            "
          >
            <div className="min-w-40 col-span-1 sm:col-span-2 [@media(min-width:1100px)]:col-span-1">
              <p className="font-medium">{appointment.centerName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.centerAddress}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                {appointment.vaccineName || appointment.vaccine}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {appointment.timeSlot || appointment.slot}
              </span>
            </div>

            <div className="justify-self-start [@media(min-width:1100px)]:justify-self-end">
              <AppointmentStatusBadge status={appointment.status} />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="link"
                className="px-0 cursor-pointer"
                onClick={onViewCenter}
              >
                View center
              </Button>

              <Button
                variant="link"
                className="px-0 cursor-pointer text-muted-foreground hover:text-primary"
                onClick={onViewTicket}
              >
                View ticket
              </Button>
            </div>

            {appointment.status === "BOOKED" && (
              <CancelAppointmentDialog
                centerName={appointment.centerName || ""}
                onConfirm={onCancel}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
