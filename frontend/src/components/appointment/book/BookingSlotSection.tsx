import { AppointmentScheduler } from "@/components/ui/appointment-scheduler";
import { useEffect, useMemo } from "react";
import type { TimeSlot, HospitalTimeSlot } from "@/types/appointment";
import { toLocalDateString } from "@/lib/utils";
import { BUSINESS_TIMEZONE } from "@/lib/validation";

type Props = {
  selectedDate: string | null;
  selectedSlot: string | null;
  availableSlots: TimeSlot[];
  allSlots: HospitalTimeSlot[];
  onDateSelect: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onResetSlot: () => void;
  isLoadingSlots?: boolean;
};

export default function BookingDateAndSlotSection({
  selectedDate,
  selectedSlot,
  availableSlots,
  allSlots,
  onDateSelect,
  onSlotSelect,
  onResetSlot,
  isLoadingSlots,
}: Props) {
  useEffect(() => {
    if (!selectedDate) {
      onDateSelect(toLocalDateString(new Date()));
    }
  }, [selectedDate, onDateSelect]);

  const availableDates = useMemo(() => {
    const defaults = generateDefaultDates();

    if (!allSlots.length) {
      return defaults.map((d) => ({ ...d, hasSlots: false }));
    }

    const datesWithSlots = new Set(
      allSlots.filter((s) => s.available).map((s) => s.date),
    );

    return defaults.map((d) => ({
      date: d.date,
      iso: d.iso,
      hasSlots: datesWithSlots.has(d.iso),
    }));
  }, [allSlots]);

  return (
    <div className="w-full relative">
      {isLoadingSlots && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg border border-dashed border-gray-200">
          <p className="text-xs text-primary font-medium animate-pulse bg-white px-3 py-1 rounded-full border shadow-sm">
            Fetching slots...
          </p>
        </div>
      )}

      <AppointmentScheduler
        userName="Vaxify"
        meetingTitle="Vaccination Appointment"
        meetingType="In-person"
        duration="1 hour"
        timezone={BUSINESS_TIMEZONE}
        selectedDateIso={selectedDate}
        selectedTime={selectedSlot}
        availableDates={availableDates}
        timeSlots={availableSlots}
        onDateSelect={(dateObj) => {
          const nextDate = toLocalDateString(dateObj);
          if (nextDate === selectedDate) return;
          onDateSelect(nextDate);
          onResetSlot();
        }}
        onTimeSelect={onSlotSelect}
      />
    </div>
  );
}

function generateDefaultDates() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const startDay = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInNextMonth = new Date(year, month + 2, 0).getDate();

  const dates: { date: number; iso: string; hasSlots: boolean }[] = [];

  for (let day = startDay; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    dates.push({
      date: day,
      iso: toLocalDateString(dateObj),
      hasSlots: false,
    });
  }

  for (let day = 1; day <= daysInNextMonth; day++) {
    const dateObj = new Date(year, month + 1, day);
    dates.push({
      date: day,
      iso: toLocalDateString(dateObj),
      hasSlots: false,
    });
  }

  return dates;
}
