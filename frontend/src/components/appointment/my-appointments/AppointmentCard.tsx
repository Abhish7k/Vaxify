import { Calendar, Clock, MapPin, Syringe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment } from "./MyAppointmentsListSection";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import CancelAppointmentDialog from "./CancelAppointmentDialog";

type Props = {
  appointment: Appointment;
  onViewCenter: () => void;
  onCancel: () => void;
};

export default function AppointmentCard({
  appointment,
  onViewCenter,
  onCancel,
}: Props) {
  return (
    <div className="w-full">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="px-6">
          {/*
            layout behavior:
            - >=1100px: single horizontal row
            - <1100px: two rows (time + status move down)
            - <640px: everything stacks vertically
          */}
          <div
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              items-center
              [@media(min-width:1100px)]:grid-cols-[1.6fr_1fr_1fr_1fr_auto]
            "
          >
            {/* center info always first */}
            <div className="min-w-40 col-span-1 sm:col-span-2 [@media(min-width:1100px)]:col-span-1">
              <p className="font-medium">{appointment.centerName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.centerAddress}
              </div>
            </div>

            {/* vaccine */}
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{appointment.vaccine}</span>
            </div>

            {/* date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.date}</span>
            </div>

            {/* time slot moves down on medium screens */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.timeSlot}</span>
            </div>

            {/* status stacks under time on smaller screens */}
            <div className="justify-self-start [@media(min-width:1100px)]:justify-self-end">
              <AppointmentStatusBadge status={appointment.status} />
            </div>
          </div>

          {/* actions stay unchanged */}
          <div className="mt-10 flex items-center justify-between">
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
    </div>
  );
}
