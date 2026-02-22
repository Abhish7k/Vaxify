import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoBackButton from "@/components/ui/go-back-button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { appointmentApi } from "@/api/appointment.api";

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [isBooking, setIsBooking] = useState(false);

  // route protection
  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { center, vaccine, date, slot } = state;

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);

      const request = {
        centerId: center.id,
        vaccineId: vaccine.id,
        date,
        slot,
      };

      const appointment = await appointmentApi.bookAppointment(request);

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
      console.error("Booking failed", error);
    } finally {
      setIsBooking(false);
    }
  };

  const formattedDate = new Date(date).toDateString();

  const day = formattedDate.split(" ")[0];
  const month = formattedDate.split(" ")[1];
  const dateday = formattedDate.split(" ")[2];
  const year = formattedDate.split(" ")[3];

  const finalDate = `${day}, ${dateday} ${month}, ${year}`;

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
        <GoBackButton label="Edit booking" />

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
