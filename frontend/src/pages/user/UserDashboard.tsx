import {
  CalendarCheck,
  ShieldCheck,
  ListChecks,
  MapPin,
  Eye,
  FileCheck,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TicketCard } from "@/components/appointment/TicketCard";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function UserDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<AppointmentMock | null>(
    null,
  );

  return (
    <div className="space-y-6 px-3 sm:px-4 lg:px-6">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Your vaccination overview
          </p>
        </div>

        <Link to="/centers">
          <Button className="w-full sm:w-auto cursor-pointer active:scale-95 transition-all">
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* top Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* upcoming appointment */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Upcoming Appointment</CardDescription>
              <CardTitle className="text-lg sm:text-xl">22 Jan 2026</CardTitle>
            </div>
            <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardFooter>
            <Badge variant="secondary">Scheduled</Badge>
          </CardFooter>
        </Card>

        {/* vaccination status */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Vaccination Status</CardDescription>
              <CardTitle className="text-lg sm:text-xl">
                Partially Vaccinated
              </CardTitle>
            </div>
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardFooter className="text-xs sm:text-sm text-muted-foreground">
            1 of 2 doses completed
          </CardFooter>
        </Card>

        {/* total appointments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Total Appointments</CardDescription>
              <CardTitle className="text-lg sm:text-xl">3</CardTitle>
            </div>
            <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardFooter className="text-xs sm:text-sm text-muted-foreground">
            Past & upcoming appointments
          </CardFooter>
        </Card>

        {/* certificate status */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Vaccination Certificate</CardDescription>
              <CardTitle className="text-lg sm:text-xl">
                Not Available
              </CardTitle>
            </div>
            <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </CardHeader>
          <CardFooter className="text-xs sm:text-sm text-muted-foreground">
            Available after full vaccination
          </CardFooter>
        </Card>
      </div>

      {/* bottom section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* recent appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Recent Appointments
            </CardTitle>
            <CardDescription>Your latest vaccination activity</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {recentAppointments.map((appt, idx) => (
              <div
                key={idx}
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
                  <Badge
                    variant={
                      appt.status === "completed" ? "outline" : "secondary"
                    }
                  >
                    {appt.status}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground cursor-pointer"
                    title="View Ticket"
                    onClick={() => setSelectedTicket(appt)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription>What would you like to do next?</CardDescription>
          </CardHeader>

          <CardContent className="">
            {QuickActionItems.map((item, idx) => (
              <Link to={item.link} key={idx}>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer active:scale-95 transition-all mb-3"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ticket dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vaccination Ticket</DialogTitle>
          </DialogHeader>

          <DialogDescription></DialogDescription>

          {selectedTicket && (
            <TicketCard
              appointmentId={selectedTicket.id}
              center={{
                name: selectedTicket.centerName,
                address: selectedTicket.centerAddress,
              }}
              vaccine={{
                name: selectedTicket.vaccineName,
              }}
              date={selectedTicket.date}
              slot={selectedTicket.slot}
              status={selectedTicket.status}
              className="shadow-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const QuickActionItems = [
  {
    name: "Book Appointments",
    link: "/centers",
  },
  {
    name: "View Appointments",
    link: "/appointments",
  },
  {
    name: "Find Centers",
    link: "/centers",
  },
];

type AppointmentMock = {
  id: string;
  centerName: string;
  centerAddress: string;
  vaccineName: string;
  date: string;
  slot: string;
  status: "scheduled" | "completed" | "cancelled";
};

const recentAppointments: AppointmentMock[] = [
  {
    id: "APT-12345",
    centerName: "City Health Center",
    centerAddress: "MG Road, Pune",
    vaccineName: "Covishield",
    date: "2026-01-22T09:00:00.000Z",
    slot: "09:00 - 10:00",
    status: "scheduled",
  },
  {
    id: "APT-67890",
    centerName: "Community Clinic",
    centerAddress: "Kalyani Nagar, Pune",
    vaccineName: "Covaxin",
    date: "2025-11-12T14:30:00.000Z",
    slot: "14:30 - 15:30",
    status: "completed",
  },
  {
    id: "APT-11223",
    centerName: "Urban Care Hospital",
    centerAddress: "Shivaji Nagar, Pune",
    vaccineName: "Covishield",
    date: "2025-09-05T11:00:00.000Z",
    slot: "11:00 - 12:00",
    status: "completed",
  },
];
