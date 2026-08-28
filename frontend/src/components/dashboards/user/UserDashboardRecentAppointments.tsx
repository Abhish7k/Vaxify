import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye } from "lucide-react";
import AppointmentStatusBadge from "@/components/appointment/my-appointments/AppointmentStatusBadge";
import type { Appointment } from "@/types/appointment";

interface UserDashboardRecentAppointmentsProps {
  appointments: Appointment[];
  onViewTicket: (appointment: Appointment) => void;
}

export default function UserDashboardRecentAppointments({
  appointments,
  onViewTicket,
}: UserDashboardRecentAppointmentsProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          Recent Appointments
        </CardTitle>
        <CardDescription>Your latest vaccination activity</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointments && appointments.length > 0 ? (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-md border p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appt.centerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(appt.date).toDateString()} • {appt.slot}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <AppointmentStatusBadge status={appt.status} />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground cursor-pointer"
                  aria-label="View ticket"
                  onClick={() => onViewTicket(appt)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No appointments found.{" "}
            <Link to="/centers" className="text-primary underline">
              Book one now
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
