import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, MoreVertical, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Appointment } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { appointmentApi } from "@/api/appointment.api";
import { toast } from "sonner";
import * as React from "react";
import { formatTime } from "@/lib/utils";

interface StaffDashboardUpcomingAppointmentsComponentProps {
  appointments: Appointment[];
  loading: boolean;
  onRefresh: () => void;
}

const StaffDashboardUpcomingAppointmentsComponent = ({
  appointments,
  loading,
  onRefresh,
}: StaffDashboardUpcomingAppointmentsComponentProps) => {
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<"complete" | "cancel" | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // filter for upcoming/booked status and sort by date/time
  const upcomingList = appointments.filter((a) => ["BOOKED", "UPCOMING", "scheduled"].includes(a.status)).slice(0, 5);

  const handleActionClick = (id: string, action: "complete" | "cancel") => {
    setPendingId(id);
    setPendingAction(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingId || !pendingAction) return;

    try {
      setActionLoading(pendingId);
      setDialogOpen(false);

      if (pendingAction === "complete") {
        await appointmentApi.completeAppointment(pendingId);
        toast.success("Appointment completed successfully");
      } else {
        await appointmentApi.cancelAppointment(pendingId);
        toast.success("Appointment cancelled");
      }
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(null);
      setPendingId(null);
      setPendingAction(null);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-medium">Upcoming Appointments</CardTitle>

        <div className="flex items-center gap-2">
          <Link to="/staff/appointments">
            <Button variant="outline" size="sm" className="cursor-pointer active:scale-95 transition-all group">
              View all
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-all duration-300" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="">
        <div className="relative overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30">
                <TableHead className="text-muted-foreground font-medium">Patient</TableHead>
                <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                <TableHead className="text-muted-foreground font-medium">Vaccine</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : upcomingList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No upcoming appointments.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingList.map((item) => (
                  <TableRow key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4 font-medium">{item.patientName}</TableCell>

                    <TableCell className="py-4 font-mono text-xs">{item.date}</TableCell>
                    <TableCell className="py-4 font-mono text-xs">{formatTime(item.timeSlot || item.slot)}</TableCell>
                    <TableCell className="py-4">{item.vaccine || item.vaccineName}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="capitalize bg-blue-50/50 text-blue-600 border-blue-100">
                        {item.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {actionLoading === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              className="text-emerald-600 cursor-pointer flex items-center gap-2"
                              onClick={() => handleActionClick(item.id, "complete")}
                            >
                              <Check className="h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer flex items-center gap-2"
                              onClick={() => handleActionClick(item.id, "cancel")}
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "complete" ? "Complete Appointment?" : "Cancel Appointment?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "complete"
                ? "Are you sure you want to mark this appointment as completed? This will deduct 1 unit from the vaccine stock."
                : "Are you sure you want to cancel this appointment? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                pendingAction === "cancel"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default StaffDashboardUpcomingAppointmentsComponent;
