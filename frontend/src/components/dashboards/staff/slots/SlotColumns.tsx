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
import { MoreHorizontal, ArrowUpDown, Calendar, Clock, Users, Trash2 } from "lucide-react";
import type { Slot } from "@/api/slots.api";
import { format } from "date-fns";
import { cn, formatTime } from "@/lib/utils";

interface SlotColumnsProps {
  onDelete: (slot: Slot) => void;
}

export const getSlotColumns = ({ onDelete }: SlotColumnsProps): ColumnDef<Slot>[] => [
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
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="flex items-center gap-2 font-medium">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(date, "dd MMM, yyyy")}
        </div>
      );
    },
  },
  {
    id: "timeRange",
    header: "Time Range",
    cell: ({ row }) => {
      const slot = row.original;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </div>
      );
    },
  },
  {
    accessorKey: "bookedCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 h-8"
      >
        Occupancy
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const slot = row.original;
      const isFull = slot.bookedCount >= slot.capacity;

      return (
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={cn(
              "font-mono text-sm",
              isFull ? "text-destructive font-bold" : "text-foreground",
            )}
          >
            {slot.bookedCount} / {slot.capacity}
          </span>
          {isFull && (
            <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase">
              Full
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize font-medium px-2.5 py-0.5",
            status === "AVAILABLE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : status === "FULL"
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-muted text-muted-foreground border-muted-foreground/10",
          )}
        >
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const slot = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-2">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 py-2"
                onClick={() => onDelete(slot)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Slot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
