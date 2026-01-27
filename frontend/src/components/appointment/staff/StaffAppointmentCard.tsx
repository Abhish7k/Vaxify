import { motion } from "framer-motion";
import { Calendar, Clock, Phone, User, Syringe } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { StaffAppointment } from "./StaffAppointmentsListSection";
import AppointmentStatusBadge from "../my-appointments/AppointmentStatusBadge";
import StaffAppointmentCardActions from "./StaffAppointmentCardActions";

type Props = {
  appointment: StaffAppointment;
  onMarkCompleted: () => void;
  onCancel: () => void;
};

export default function StaffAppointmentCard({
  appointment,
  onMarkCompleted,
  onCancel,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="">
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
              [@media(min-width:1100px)]:grid-cols-[1.4fr_1fr_1fr_1fr_auto]
            "
          >
            {/* patient info always first */}
            <div className="flex items-center gap-3 col-span-1 sm:col-span-2 [@media(min-width:1100px)]:col-span-1">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{appointment.patientName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {appointment.patientPhone}
                </div>
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

            {/* time slot moves to its own row below 1100px */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.timeSlot}</span>
            </div>

            {/* status stacks under time on smaller screens */}
            <div className="justify-self-start [@media(min-width:1100px)]:justify-self-end">
              <AppointmentStatusBadge status={appointment.status} />
            </div>
          </div>

          {/* actions unchanged */}
          {appointment.status === "UPCOMING" && (
            <div className="mt-10">
              <StaffAppointmentCardActions
                patientName={appointment.patientName}
                status={appointment.status}
                onMarkCompleted={onMarkCompleted}
                onCancel={onCancel}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
