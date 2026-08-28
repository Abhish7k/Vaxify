import { MoreVertical, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Hospital } from "@/types/hospital";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminDashboardPendingHospitals({
  pendingHospitals,
}: {
  pendingHospitals: Hospital[];
}) {
  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Hospital Approvals</CardTitle>

        <Link to="/admin/hospitals?status=pending">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer active:scale-95 transition-all"
          >
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="">
        <div className="relative overflow-x-auto border rounded-md">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pendingHospitals.length > 0 ? (
                pendingHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">
                      {hospital.name}
                    </TableCell>

                    <TableCell>
                      {hospital.city}, {hospital.state}
                    </TableCell>

                    <TableCell>
                      {hospital.staffCreatedAt
                        ? new Date(hospital.staffCreatedAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-100 uppercase text-[10px]"
                      >
                        {hospital.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 cursor-pointer"
                              aria-label="Open hospital actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`/admin/hospitals/${hospital.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No pending approvals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
