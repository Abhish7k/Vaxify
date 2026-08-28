import { useState } from "react";
import { format, addDays, eachDayOfInterval, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, CalendarRange, Loader2 } from "lucide-react";
import { toastUtils } from "@/lib/toast";

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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { clampSlotCapacity, SLOT_CAPACITY_MAX } from "@/lib/validation";

import { useBulkCreateSlots } from "@/hooks/queries/use-slots";

interface BulkCreateSlotDialogProps {
  hospitalId: string | null;
  onSuccess?: () => void;
}

const WEEKDAYS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

export function BulkCreateSlotDialog({ hospitalId, onSuccess }: BulkCreateSlotDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bulkCreateSlots = useBulkCreateSlots();
  const loading = bulkCreateSlots.isPending;

  // date range
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));

  // time & capacity
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [capacity, setCapacity] = useState(10);

  // days selection (default Mon-Fri)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  const handleBulkCreate = async () => {
    if (!hospitalId || !startDate || !endDate) {
      toastUtils.error("Please select a valid date range");

      return;
    }

    if (startDate > endDate) {
      toastUtils.error("Start date cannot be after end date");

      return;
    }

    if (selectedDays.length === 0) {
      toastUtils.error("Please select at least one day of the week");

      return;
    }

    if (startTime >= endTime) {
      toastUtils.error("Start time must be before end time");

      return;
    }

    // validation for past date/time check for today
    const now = new Date();
    const isTodaySelected = format(startDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isTodaySelected) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDateTime = new Date(startDate);

      startDateTime.setHours(hours, minutes, 0, 0);

      if (startDateTime < now) {
        toastUtils.error("Cannot create slots for a past time today. Please adjust the start time.");

        return;
      }
    }

    try {
      // generate dates
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });

      // filter by selected weekdays
      const targetDates = allDates.filter((date) => selectedDays.includes(date.getDay()));

      if (targetDates.length === 0) {
        toastUtils.error("No matching dates in the selected range");

        return;
      }

      if (targetDates.length > 62) {
        toastUtils.error("Cannot create more than 62 slots in one request");
        return;
      }

      const result = await bulkCreateSlots.mutateAsync(
        targetDates.map((date) => ({
          hospitalId,
          date: format(date, "yyyy-MM-dd"),
          startTime: startTime.length === 5 ? startTime + ":00" : startTime,
          endTime: endTime.length === 5 ? endTime + ":00" : endTime,
          capacity,
        })),
      );

      if (result.skipped > 0) {
        toastUtils.success(
          `Created ${result.created} slots (${result.skipped} already existed and were skipped)`,
        );
      } else {
        toastUtils.success(`Successfully created ${result.created} slots`);
      }

      setIsOpen(false);

      onSuccess?.();
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to create some slots. Please try again."));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setStartDate(new Date());
          setEndDate(addDays(new Date(), 7));
          setStartTime("09:00");
          setEndTime("17:00");
          setCapacity(10);
          setSelectedDays([1, 2, 3, 4, 5]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <CalendarRange className="h-4 w-4 mr-2" />
          Bulk Create
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Create Slots</DialogTitle>

          <DialogDescription>Create appointment slots for multiple days at once.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-5">
          {/* date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2.5">
              <Label htmlFor="bulk-start-date" className="text-sm font-semibold flex items-center gap-2">
                Start Date
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="bulk-start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-medium h-11 border-border/60 hover:border-primary/50 transition-all",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 opacity-50 text-primary" />
                    {startDate ? format(startDate, "dd MMM, yyyy") : <span>Start date</span>}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="min-w-[280px] p-0 shadow-2xl border-none rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    defaultMonth={startDate}
                    className="rounded-xl border border-border"
                    disabled={(date) => date < startOfDay(new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="bulk-end-date" className="text-sm font-semibold flex items-center gap-2">
                End Date
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="bulk-end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-medium h-11 border-border/60 hover:border-primary/50 transition-all",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 opacity-50 text-primary" />
                    {endDate ? format(endDate, "dd MMM, yyyy") : <span>End date</span>}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="min-w-[280px] p-0 shadow-2xl border-none rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    defaultMonth={endDate}
                    className="rounded-xl border border-border"
                    disabled={(date) => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* weekdays selection */}
          <div className="space-y-3">
            <Label id="bulk-repeat-on-label" className="text-sm font-semibold flex items-center gap-2">
              Repeat On
            </Label>

            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="bulk-repeat-on-label">
              {WEEKDAYS.map((day) => {
                const isSunday = day.id === 0;
                return (
                  <label
                    key={day.id}
                    className={cn(
                      "flex items-center space-x-2 border rounded-xl px-4 py-2.5 transition-all duration-200",
                      isSunday
                        ? "opacity-50 cursor-not-allowed bg-muted border-dashed"
                        : "cursor-pointer",
                      !isSunday &&
                        (selectedDays.includes(day.id)
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "hover:bg-muted border-border/60"),
                    )}
                  >
                    <Checkbox
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => !isSunday && toggleDay(day.id)}
                      disabled={isSunday}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-semibold">{day.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2.5">
              <Label htmlFor="bulk-start-time" className="text-sm font-semibold flex items-center gap-2">
                Start
              </Label>

              <div className="relative group">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                <Input
                  id="bulk-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="bulk-end-time" className="text-sm font-semibold flex items-center gap-2">
                End
              </Label>

              <div className="relative group">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                <Input
                  id="bulk-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="bulk-capacity" className="text-sm font-semibold flex items-center gap-2">
                Max
              </Label>

              <div className="relative group">
                <Users className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                <Input
                  id="bulk-capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(clampSlotCapacity(e.target.value))}
                  className="pl-10 h-11 border-border/60 focus-visible:ring-primary/20 transition-all"
                  min={1}
                  max={SLOT_CAPACITY_MAX}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl text-[11px] font-medium text-primary/80 border border-primary/10 leading-relaxed">
            Quick Tip: Slots will be auto-generated for every selected weekday within your chosen date
            range.
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleBulkCreate}
            disabled={loading}
            className="active:scale-95 transition-all"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating Slots..." : "Create Bulk Slots"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
