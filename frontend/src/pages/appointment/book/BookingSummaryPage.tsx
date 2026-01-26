import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoBackButton from "@/components/ui/go-back-button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // route protection
  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { center, vaccine, date, slot } = state;

  const handleConfirmBooking = () => {
    // simulate backend response
    const appointmentId = `APT-${Date.now()}`;

    navigate("/appointments/book/success", {
      state: {
        appointmentId,
        center,
        vaccine,
        date,
        slot,
      },
      replace: true,
    });

    // later:
    // await bookAppointment(payload)
  };

  return (
    <div className="py-10 max-w-3xl mx-auto px-4 space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
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
              {new Date(date).toDateString()} • {slot}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <GoBackButton label="Edit booking" />

        <Button
          className="text-sm gap-2 cursor-pointer active:scale-95 transition-all"
          onClick={handleConfirmBooking}
        >
          <CheckCircle className="w-4 h-4" />
          Confirm Appointment
        </Button>
      </div>
    </div>
  );
}
