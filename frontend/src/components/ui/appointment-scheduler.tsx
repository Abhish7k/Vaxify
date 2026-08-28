import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, parseDateOnly } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableDate {
  date: number;
  iso?: string;
  hasSlots: boolean;
}

export interface AppointmentSchedulerProps {
  userName: string;
  userAvatar?: string;
  meetingTitle: string;
  meetingType: string;
  duration: string;
  timezone: string;
  selectedDateIso?: string | null;
  selectedTime?: string | null;
  availableDates?: AvailableDate[];
  timeSlots?: TimeSlot[];
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  onTimezoneChange?: (timezone: string) => void;
}

export function AppointmentScheduler({
  availableDates = [],
  timeSlots = [],
  timezone,
  selectedDateIso,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: AppointmentSchedulerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateObj = selectedDateIso ? parseDateOnly(selectedDateIso) : null;

  const [currentMonth, setCurrentMonth] = useState(
    () => selectedDateObj?.getMonth() ?? today.getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    () => selectedDateObj?.getFullYear() ?? today.getFullYear(),
  );
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");

  useEffect(() => {
    if (!selectedDateObj || Number.isNaN(selectedDateObj.getTime())) return;
    setCurrentMonth(selectedDateObj.getMonth());
    setCurrentYear(selectedDateObj.getFullYear());
  }, [selectedDateIso]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) return;

    onDateSelect?.(selected);
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect?.(time);
  };

  const formatDisplayTime = (time: string) => {
    const clock = time.split(":").slice(0, 2).join(":");
    if (timeFormat === "24h") return clock;
    const [h, m] = clock.split(":");
    const hour = Number(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
  };

  const selectedDateLabel = (selectedDateObj ?? new Date(currentYear, currentMonth, 1)).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  const isSelectedDay = (day: number) =>
    Boolean(
      selectedDateObj &&
        !Number.isNaN(selectedDateObj.getTime()) &&
        selectedDateObj.getDate() === day &&
        selectedDateObj.getMonth() === currentMonth &&
        selectedDateObj.getFullYear() === currentYear,
    );

  const isSelectedTime = (time: string) =>
    Boolean(
      selectedTime &&
        time.split(":").slice(0, 2).join(":") === selectedTime.split(":").slice(0, 2).join(":"),
    );

  const isPastSlotOnSelectedDay = (slotTime: string) => {
    if (!selectedDateObj || Number.isNaN(selectedDateObj.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(selectedDateObj);
    selectedDay.setHours(0, 0, 0, 0);
    if (selectedDay.getTime() !== today.getTime()) return false;

    const [h, m] = slotTime.split(":").map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);

    return slotDate < new Date();
  };

  return (
    <div className="flex flex-col lg:flex-row w-full border rounded-xl bg-card overflow-hidden shadow-xl transition-all xl:min-w-[650px] ">
      {/* calendar */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">
            {monthNames[currentMonth]} <span className="text-muted-foreground">{currentYear}</span>
          </h3>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground">
              {d}
            </div>
          ))}

          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${currentYear}-${currentMonth}-${idx}`} />;

            const isAvailable = (() => {
              const cellDate = new Date(currentYear, currentMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const isFutureOrToday = cellDate >= today;
              const isSunday = cellDate.getDay() === 0;
              const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dateMeta = availableDates.find(
                (d) => d.iso === iso || (!d.iso && d.date === day),
              );
              const hasSlots = dateMeta ? dateMeta.hasSlots : availableDates.length === 0;

              return isFutureOrToday && !isSunday && hasSlots;
            })();

            return (
              <button
                key={`${currentYear}-${currentMonth}-${day}`}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleDateClick(day)}
                aria-pressed={isSelectedDay(day)}
                aria-label={`${day} ${monthNames[currentMonth]} ${currentYear}`}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all p-2 lg:px-3 lg:py-2",
                  isSelectedDay(day) && "bg-primary text-primary-foreground shadow",
                  !isSelectedDay(day) && isAvailable && "bg-secondary/50 hover:bg-secondary",
                  !isAvailable && "text-muted-foreground/40 cursor-not-allowed",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* time slots */}
      <div className="w-full lg:w-60 border-t lg:border-t-0 lg:border-l p-6">
        <div className="flex justify-between mb-4">
          <div className="min-w-0">
            <span className="text-sm font-medium">{selectedDateLabel}</span>
            <p className="text-[11px] text-muted-foreground truncate">{timezone}</p>
          </div>

          <div className="flex bg-secondary rounded p-1">
            {(["12h", "24h"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTimeFormat(f)}
                aria-pressed={timeFormat === f}
                aria-label={`${f === "12h" ? "12-hour" : "24-hour"} time format`}
                className={cn(
                  "px-2 py-1 text-xs rounded cursor-pointer transition-all",
                  timeFormat === f && "bg-background",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {timeSlots.map((slot) => {
            const past = isPastSlotOnSelectedDay(slot.time);
            const selected = isSelectedTime(slot.time);

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available || past}
                onClick={() => handleTimeClick(slot.time)}
                aria-pressed={selected}
                className={cn(
                  "w-full py-2 rounded-lg text-sm transition cursor-pointer",
                  selected && "bg-primary text-primary-foreground",
                  slot.available && !selected && "bg-secondary/50 hover:bg-secondary",
                  (!slot.available || past) &&
                    "text-muted-foreground/40 cursor-not-allowed opacity-50 bg-muted/20",
                )}
              >
                {formatDisplayTime(slot.time)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
