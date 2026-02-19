import { AppointmentScheduler } from "@/components/ui/appointment-scheduler";
import { useEffect } from "react";
import type { TimeSlot, HospitalTimeSlot } from "@/types/appointment";
import { useMemo } from "react";

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
  availableSlots,
  allSlots,
  onDateSelect,
  onSlotSelect,
  onResetSlot,
  isLoadingSlots,
}: Props) {
  useEffect(() => {
    // defaults to today if not selected
    if (!selectedDate) {
      const today = new Date();
      onDateSelect(today.toISOString().split("T")[0]);
    }
  }, []);

  const availableDates = useMemo(() => {
    if (!allSlots.length) return generateDefaultDates();

    // extract unique dates that have at least one available slot
    const datesWithSlots = new Set(
      allSlots.filter((s) => s.available).map((s) => s.date),
    );

    return generateDefaultDates().map((d) => {
      // check if this date (day number) matches any date in datesWithSlots
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(d.date).padStart(2, "0")}`;

      return {
        ...d,
        hasSlots: datesWithSlots.has(dateStr),
      };
    });
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

      {/* scheduler */}
      <AppointmentScheduler
        userName="Vaxify"
        meetingTitle="Vaccination Appointment"
        meetingType="In-person"
        duration="1 hour"
        timezone="IST"
        availableDates={availableDates}
        timeSlots={availableSlots}
        onDateSelect={(dateObj) => {
          // manually format to avoid timezone issues with ISOString
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          onDateSelect(dateStr);
          onResetSlot();
        }}
        onTimeSelect={onSlotSelect}
      />
    </div>
  );
}

function generateDefaultDates() {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  const dates = [];

  for (let day = currentDay; day <= daysInMonth; day++) {
    dates.push({
      date: day,
      hasSlots: true,
    });
  }

  return dates;
}
