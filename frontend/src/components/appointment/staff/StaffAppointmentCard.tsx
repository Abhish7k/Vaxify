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
        <CardContent className="px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            {/* Name */}
            <div className="flex items-center gap-3 md:min-w-40">
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
            <div className="flex items-center gap-2 ">
              <Syringe className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{appointment.vaccine}</span>
            </div>

            {/* date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.date}</span>
            </div>

            {/* time slot */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.timeSlot}</span>
            </div>

            {/* status */}
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          {/* actions */}
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
