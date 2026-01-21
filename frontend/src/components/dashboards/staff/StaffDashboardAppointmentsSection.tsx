"use client";

import { ChevronRight, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function StaffAppointmentsSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Upcoming Appointments */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Appointments</CardTitle>

          <div className="flex items-center gap-2">
            <Link to="/staff/appointments">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer active:scale-95 transition-all group"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="relative overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-muted-foreground font-medium">
                    Patient
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Time
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Vaccine
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Status
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {upcomingAppointments.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="py-4 font-medium">
                      {item.patient}
                    </TableCell>

                    <TableCell className="py-4">{item.date}</TableCell>
                    <TableCell className="py-4">{item.time}</TableCell>
                    <TableCell className="py-4">{item.vaccine}</TableCell>
                    <TableCell className="py-4">{item.status}</TableCell>
                    <TableCell className="py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Vaccinations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Vaccinations</CardTitle>

          <Link to="/staff/appointments">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer active:scale-95 transition-all group"
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-all duration-300" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-4">
          {recentVaccinations.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{item.patient.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium">{item.patient}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.vaccine}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const upcomingAppointments = [
  {
    id: 1,
    patient: "Rahul Sharma",
    date: "2026-01-22",
    time: "10:00 AM",
    vaccine: "Covishield",
    status: "Scheduled",
  },
  {
    id: 2,
    patient: "Anita Verma",
    date: "2026-01-22",
    time: "11:30 AM",
    vaccine: "Covaxin",
    status: "Scheduled",
  },
  {
    id: 3,
    patient: "Mohit Kumar",
    date: "2026-01-22",
    time: "02:00 PM",
    vaccine: "Covishield",
    status: "Scheduled",
  },
  {
    id: 4,
    patient: "Neha Singh",
    date: "2026-01-23",
    time: "09:30 AM",
    vaccine: "Covaxin",
    status: "Scheduled",
  },
];

const recentVaccinations = [
  {
    id: 1,
    patient: "Suresh Patel",
    vaccine: "Covishield",
    date: "2026-01-21",
  },
  {
    id: 2,
    patient: "Pooja Mehta",
    vaccine: "Covaxin",
    date: "2026-01-21",
  },
  {
    id: 3,
    patient: "Amit Kumar",
    vaccine: "Covishield",
    date: "2026-01-20",
  },
  {
    id: 4,
    patient: "Kiran Rao",
    vaccine: "Covaxin",
    date: "2026-01-20",
  },
];
