import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoBackButton from "@/components/ui/go-back-button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage, isConflictError } from "@/lib/errors";
import { parseDateOnly } from "@/lib/utils";
import { format } from "date-fns";
import { useBookAppointment } from "@/hooks/queries/use-appointments";
import { clearBookingDraft, loadBookingDraft } from "@/lib/booking-draft";

type BookingSummaryState = {
  center: { id: string; name: string; address: string };
  vaccine: { id: string; name: string };
  date: string;
  slot: string;
};

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [isBooking, setIsBooking] = useState(false);
  const bookAppointment = useBookAppointment();

  const summary = useMemo<BookingSummaryState | null>(() => {
    const fromState = state as BookingSummaryState | null;
    if (fromState?.center && fromState.vaccine && fromState.date && fromState.slot) {
      return fromState;
    }

    const draft = loadBookingDraft();
    if (draft?.center && draft.vaccine && draft.selectedDate && draft.selectedSlot) {
      return {
        center: draft.center,
        vaccine: draft.vaccine,
        date: draft.selectedDate,
        slot: draft.selectedSlot,
      };
    }

    return null;
  }, [state]);

  useEffect(() => {
    if (!summary) {
      navigate("/", { replace: true });
    }
  }, [summary, navigate]);

  if (!summary) return null;

  const { center, vaccine, date, slot } = summary;

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);

      const request = {
        centerId: center.id,
        vaccineId: vaccine.id,
        date,
        slot,
      };

      const appointment = await bookAppointment.mutateAsync(request);
      clearBookingDraft(center.id);

      navigate("/appointments/book/success", {
        state: {
          appointmentId: appointment.id,
          center,
          vaccine,
          date,
          slot,
        },
        replace: true,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Booking failed. Please try again.");
      if (isConflictError(error)) {
        toastUtils.error(message);
        const slotTaken = /already full|just taken|no available slot/i.test(message);
        if (slotTaken) {
          navigate(`/appointments/book/${center.id}`, {
            replace: true,
            state: { slotTaken: true },
          });
        }
        return;
      }

      toastUtils.error(message);
    } finally {
      setIsBooking(false);
    }
  };

  const finalDate = format(parseDateOnly(date), "EEE, dd MMM, yyyy");

  const finalSlot = slot?.slice(0, 5);

  return (
    <div className="py-10 max-w-3xl mx-auto px-10 space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <h1 className="text-xl font-semibold">Review your booking</h1>

      <Card>
        <CardContent className="p-6 space-y-4 text-sm">
          <div>
            <span className="text-muted-foreground">Center</span>
            <p className="font-medium">{center.name}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Vaccine</span>
            <p className="font-medium">{vaccine.name}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Date & Time</span>

            <p className="font-medium">
              {finalDate} • {finalSlot}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <GoBackButton label="Edit booking" fallback={`/appointments/book/${center.id}`} />

        <Button
          className="text-xs sm:text-sm gap-2 cursor-pointer active:scale-95 transition-all"
          onClick={handleConfirmBooking}
          disabled={isBooking}
        >
          {isBooking ? (
            <Loader2 className="size-3.5 sm:size-4 animate-spin" />
          ) : (
            <CheckCircle className="size-3.5 sm:size-4" />
          )}
          Confirm Appointment
        </Button>
      </div>
    </div>
  );
}
