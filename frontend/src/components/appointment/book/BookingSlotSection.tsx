import { AppointmentScheduler } from "@/components/ui/appointment-scheduler";
import { useEffect } from "react";
import type { TimeSlot } from "@/types/appointment";

type Props = {
  selectedDate: string | null;
  selectedSlot: string | null;
  availableSlots: TimeSlot[];
  onDateSelect: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onResetSlot: () => void;
  isLoadingSlots?: boolean;
};

export default function BookingDateAndSlotSection({
  selectedDate,
  availableSlots,
  onDateSelect,
  onSlotSelect,
  onResetSlot,
  isLoadingSlots,
}: Props) {
  useEffect(() => {
    // defaults to today if not selected
    if (!selectedDate) {
      const today = new Date();

      onDateSelect(today.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-fit relative">
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
        onDateSelect={(day) => {
          const date = new Date();
          date.setDate(day);
          onDateSelect(date.toISOString());
          onResetSlot();
        }}
        onTimeSelect={onSlotSelect}
      />
    </div>
  );
}

const availableDates = generateAvailableDates();

function generateAvailableDates() {
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
