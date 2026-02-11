import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  X,
  Calendar,
  Clock,
  Syringe,
  MapPin,
  Ticket,
  Eye,
} from "lucide-react";
import type { Appointment } from "@/types/appointment";
import { formatTimeRange, formatDate } from "@/lib/utils";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

interface GetColumnsProps {
  onCancelAppointment: (appointment: Appointment) => void;
  onViewTicket: (appointmentId: string) => void;
  onViewCenter: (centerId: string) => void;
}

export const getMyAppointmentsColumns = ({
  onCancelAppointment,
  onViewTicket,
  onViewCenter,
}: GetColumnsProps): ColumnDef<Appointment>[] => [
  {
    accessorKey: "centerName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8"
      >
        Center
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col max-w-[200px]">
        <span
          className="font-medium text-foreground truncate"
          title={row.getValue("centerName")}
        >
          {row.getValue("centerName")}
        </span>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate" title={row.original.centerAddress}>
            {row.original.centerAddress}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "vaccineName",
    header: "Vaccine",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Syringe className="h-4 w-4 text-primary opacity-70" />
        <span className="font-medium">{row.getValue("vaccineName")}</span>
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
        <span>{formatDate(row.getValue("date"))}</span>
      </div>
    ),
  },
  {
    accessorKey: "slot",
    header: "Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
        <Clock className="h-3 w-3" />
        <span>{formatTimeRange(row.getValue("slot"))}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-start">
        <AppointmentStatusBadge status={row.getValue("status")} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      const isUpcoming = appointment.status === "BOOKED";
      const isCompleted = appointment.status === "COMPLETED";

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
                className="cursor-pointer flex items-center gap-2 py-2"
                onClick={() => onViewCenter(appointment.centerId)}
              >
                <Eye className="h-4 w-4" />
                View Center
              </DropdownMenuItem>

              {(isUpcoming || isCompleted) && (
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-2"
                  onClick={() => onViewTicket(appointment.id)}
                >
                  <Ticket className="h-4 w-4" />
                  View Ticket
                </DropdownMenuItem>
              )}

              {isUpcoming && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 py-2"
                    onClick={() => onCancelAppointment(appointment)}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
