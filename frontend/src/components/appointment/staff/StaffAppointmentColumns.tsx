import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Check, X, Phone, Calendar, Clock, Syringe } from "lucide-react";
import type { Appointment as StaffAppointment } from "@/types/appointment";
import { formatTime, formatDate } from "@/lib/utils";

interface GetColumnsProps {
  onMarkCompleted: (appointment: StaffAppointment) => void;
  onCancelAppointment: (appointment: StaffAppointment) => void;
}

export const getStaffAppointmentColumns = ({
  onMarkCompleted,
  onCancelAppointment,
}: GetColumnsProps): ColumnDef<StaffAppointment>[] => [
  {
    accessorKey: "patientName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8"
      >
        Patient Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.getValue("patientName")}</span>
    ),
  },
  {
    accessorKey: "patientPhone",
    header: "Phone Number",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Phone className="h-3 w-3" />
        {row.getValue("patientPhone")}
      </div>
    ),
  },
  {
    accessorKey: "vaccine",
    header: "Vaccine",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Syringe className="h-4 w-4 text-primary opacity-70" />
        <span className="font-medium">{row.getValue("vaccine")}</span>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm whitespace-nowrap">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{formatDate(row.getValue("date") as string)}</span>
      </div>
    ),
  },
  {
    accessorKey: "timeSlot",
    header: "Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
        <Clock className="h-3 w-3" />
        <span>{formatTime(row.getValue("timeSlot"))}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      switch (status) {
        case "UPCOMING":
          return (
            <Badge
              variant="outline"
              className="bg-blue-50/50 text-blue-600 border-blue-100 font-medium px-2.5 py-0.5"
            >
              Upcoming
            </Badge>
          );
        case "COMPLETED":
          return (
            <Badge
              variant="outline"
              className="bg-emerald-50/50 text-emerald-600 border-emerald-100 font-medium px-2.5 py-0.5"
            >
              Completed
            </Badge>
          );
        case "CANCELLED":
          return (
            <Badge
              variant="outline"
              className="bg-red-50/50 text-red-600 border-red-100 font-medium px-2.5 py-0.5"
            >
              Cancelled
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;

      if (appointment.status !== "UPCOMING") {
        return null;
      }

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer flex items-center gap-2 py-2"
                onClick={() => onMarkCompleted(appointment)}
              >
                <Check className="h-4 w-4" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 py-2"
                onClick={() => onCancelAppointment(appointment)}
              >
                <X className="h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
