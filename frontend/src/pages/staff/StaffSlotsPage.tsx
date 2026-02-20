import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

import { hospitalApi } from "@/api/hospital.api";
import { slotsApi, type Slot } from "@/api/slots.api";
import { BulkCreateSlotDialog } from "./BulkCreateSlotDialog";
import { getSlotColumns } from "@/components/dashboards/staff/slots/SlotColumns";

export default function StaffSlotsPage() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hospitalId, setHospitalId] = useState<string | null>(null);

  // dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // delete alert state
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // form state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [capacity, setCapacity] = useState(10);

  const fetchSlots = async (hid: string) => {
    try {
      setLoading(true);
      const data = await slotsApi.getSlotsByHospital(hid);
      // sort by date and time
      data.sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.startTime);
        const dateB = new Date(b.date + "T" + b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
      setSlots(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!hospitalId) return;
    try {
      setLoading(true);

      const data = await slotsApi.getSlotsByHospital(hospitalId);

      // sort by date and time
      data.sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.startTime);
        const dateB = new Date(b.date + "T" + b.startTime);
        return dateA.getTime() - dateB.getTime();
      });

      setSlots(data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    try {
      const hospital = await hospitalApi.getMyHospital();
      if (hospital && hospital.id) {
        setHospitalId(String(hospital.id));
        fetchSlots(String(hospital.id));
      } else {
        setLoading(false);
        toast.error("No hospital found for your account");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load hospital details");
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleCreateSlot = async () => {
    if (!hospitalId || !date) return;

    // validation for past date/time check
    const now = new Date();
    const selectedDate = new Date(date);
    const [hours, minutes] = startTime.split(":").map(Number);
    selectedDate.setHours(hours, minutes, 0, 0);

    if (selectedDate < now) {
      toast.error("Cannot create a slot in the past. Please select a future time.");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be before end time.");
      return;
    }

    try {
      setCreateLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");

      await slotsApi.createSlot({
        hospitalId,
        date: formattedDate,
        startTime: startTime.length === 5 ? startTime + ":00" : startTime,
        endTime: endTime.length === 5 ? endTime + ":00" : endTime,
        capacity,
        status: "AVAILABLE",
      });

      toast.success("Slot created successfully");
      setIsCreateOpen(false);
      fetchSlots(hospitalId);
    } catch (error) {
      console.error(error);
      // @ts-ignore
      const message = error.response?.data || "Failed to create slot";
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;

    try {
      setDeleteLoading(true);
      await slotsApi.deleteSlot(slotToDelete.id);
      toast.success("Slot deleted successfully");
      if (hospitalId) fetchSlots(hospitalId);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Failed to delete slot";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
      setIsDeleteAlertOpen(false);
      setSlotToDelete(null);
    }
  };

  const columns = useMemo(
    () =>
      getSlotColumns({
        onDelete: (slot) => {
          setSlotToDelete(slot);
          setIsDeleteAlertOpen(true);
        },
      }),
    [],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Appointment Slots
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage availability for your vaccination center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh
          </Button>

          <BulkCreateSlotDialog
            hospitalId={hospitalId}
            onSuccess={() => hospitalId && fetchSlots(hospitalId)}
          />

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Slot</DialogTitle>
                <DialogDescription>
                  Define a new time slot for appointments.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-5">
                {/* Date Picker */}
                <div className="grid gap-2.5">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    Appointment Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-medium h-11 border-border/60 hover:border-primary/50 transition-all",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4 opacity-50 text-primary" />
                        {date ? format(date, "PPPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="min-w-[280px] p-0 shadow-2xl border-none rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="rounded-xl border border-border"
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          date.getDay() === 0
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      Start Time
                    </Label>
                    <div className="relative group">
                      <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2.5">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      End Time
                    </Label>
                    <div className="relative group">
                      <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="grid gap-2.5">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    Slot Capacity
                  </Label>
                  <div className="relative group">
                    <Users className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="number"
                      value={capacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 10) setCapacity(10);
                        else setCapacity(val);
                      }}
                      className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                      min={1}
                      max={10}
                    />
                    <div className="absolute right-3 top-3 text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Max 10
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCreateSlot} disabled={createLoading} className="active:scale-95 transition-all">
                  {createLoading ? "Creating..." : "Create Slot"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Active Slots
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <DataTable
            columns={columns}
            data={slots}
            searchKey="date"
            searchPlaceholder="Search by date..."
            loading={loading}
            pagination={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time slot? This action cannot
              be undone and any existing bookings might be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
