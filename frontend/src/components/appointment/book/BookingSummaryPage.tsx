import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoBackButton from "@/components/ui/go-back-button";
import { CheckCircle } from "lucide-react";

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    navigate("/");

    return null;
  }

  const { center, vaccine, date, slot } = state;

  const handleConfirmBooking = () => {
    const payload = {
      centerId: center.id,
      vaccineId: vaccine.id,
      date,
      time: slot,
    };

    console.log("final booking payload", payload);

    // later:
    // await bookAppointment(payload)
    // navigate("/booking/success");
  };

  return (
    <div className="py-10 max-w-3xl mx-auto px-4 space-y-6">
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
