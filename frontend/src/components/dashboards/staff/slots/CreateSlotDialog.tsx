import { useState } from "react";
import { toastUtils } from "@/lib/toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, Users } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { clampSlotCapacity, SLOT_CAPACITY_MAX } from "@/lib/validation";
import { useCreateSlot } from "@/hooks/queries/use-slots";

interface CreateSlotDialogProps {
  hospitalId: string | null;
}

export function CreateSlotDialog({ hospitalId }: CreateSlotDialogProps) {
  const createSlot = useCreateSlot();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [capacity, setCapacity] = useState(10);

  const handleCreateSlot = async () => {
    if (!hospitalId || !date) return;

    const now = new Date();
    const selectedDate = new Date(date);
    const [hours, minutes] = startTime.split(":").map(Number);
    selectedDate.setHours(hours, minutes, 0, 0);

    if (selectedDate < now) {
      toastUtils.error("Cannot create a slot in the past. Please select a future time.");
      return;
    }

    if (startTime >= endTime) {
      toastUtils.error("Start time must be before end time.");
      return;
    }

    try {
      const formattedDate = format(date, "yyyy-MM-dd");

      await createSlot.mutateAsync({
        hospitalId,
        date: formattedDate,
        startTime: startTime.length === 5 ? startTime + ":00" : startTime,
        endTime: endTime.length === 5 ? endTime + ":00" : endTime,
        capacity,
      });

      toastUtils.success("Slot created successfully");
      setIsCreateOpen(false);
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to create slot"));
    }
  };

  return (
    <Dialog
      open={isCreateOpen}
      onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          setDate(new Date());
          setStartTime("09:00");
          setEndTime("17:00");
          setCapacity(10);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Slot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Slot</DialogTitle>
          <DialogDescription>Define a new time slot for appointments.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-5">
          <div className="grid gap-2.5">
            <Label htmlFor="slot-date" className="text-sm font-semibold flex items-center gap-2">
              Appointment Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="slot-date"
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
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2.5">
              <Label htmlFor="slot-start-time" className="text-sm font-semibold flex items-center gap-2">
                Start Time
              </Label>
              <div className="relative group">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="slot-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="slot-end-time" className="text-sm font-semibold flex items-center gap-2">
                End Time
              </Label>
              <div className="relative group">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="slot-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2.5">
            <Label htmlFor="slot-capacity" className="text-sm font-semibold flex items-center gap-2">
              Slot Capacity
            </Label>
            <div className="relative group">
              <Users className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="slot-capacity"
                type="number"
                value={capacity}
                  onChange={(e) => setCapacity(clampSlotCapacity(e.target.value))}
                className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                min={1}
                max={SLOT_CAPACITY_MAX}
              />
              <div className="absolute right-3 top-3 text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Max 10
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreateSlot}
            disabled={createSlot.isPending}
            className="active:scale-95 transition-all"
          >
            {createSlot.isPending ? "Creating..." : "Create Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
