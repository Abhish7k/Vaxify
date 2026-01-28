import type { ColumnDef } from "@tanstack/react-table";
import type { Vaccine } from "@/types/vaccine";
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
import {
  MoreHorizontal,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface GetColumnsProps {
  onUpdate: (vaccine: Vaccine) => void;
  onDelete: (vaccine: Vaccine) => void;
}

// to define the vaccine stock table columns
export const getVaccineColumns = ({
  onUpdate,
  onDelete,
}: GetColumnsProps): ColumnDef<Vaccine>[] => [
  // vaccine name column
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Vaccine Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("manufacturer")}
      </div>
    ),
  },
  // vaccine stock column
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = parseFloat(row.getValue("stock"));
      return (
        <div className="flex items-center gap-2 font-mono">
          {stock < 100 && stock > 0 && (
            <TrendingDown className="h-4 w-4 text-amber-500" />
          )}
          {stock >= 100 && <TrendingUp className="h-4 w-4 text-emerald-500" />}
          {stock === 0 && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8"
        >
          Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono">{row.getValue("capacity")}</div>
    ),
  },
  {
    // status badge column
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const stock = parseFloat(row.getValue("stock"));
      if (stock > 100) {
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
            In Stock
          </Badge>
        );
      } else if (stock > 0) {
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
            Low Stock
          </Badge>
        );
      } else {
        return <Badge variant="destructive">Out Of Stock</Badge>;
      }
    },
  },
  // last updated timestamp
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8"
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastUpdated"));
      return (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  // row action menu
  {
    id: "actions",
    cell: ({ row }) => {
      const vaccine = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(vaccine.id)}
              >
                Copy Vaccine ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onUpdate(vaccine)}
              >
                Update Stock
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                onClick={() => onDelete(vaccine)}
              >
                Delete Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
