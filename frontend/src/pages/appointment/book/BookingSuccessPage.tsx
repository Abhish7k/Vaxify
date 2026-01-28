import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppointmentBookingSuccess } from "@/components/appointment/book/success/AppointmentTicket";

export default function BookingSuccessPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const state = location.state as BookingSuccessState | null;

  // safe redirect
  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <AppointmentBookingSuccess
        appointmentId={state.appointmentId}
        center={state.center}
        vaccine={state.vaccine}
        date={state.date}
        slot={state.slot}
      />
    </div>
  );
}

type BookingSuccessState = {
  appointmentId: string;
  center: {
    id: string;
    name: string;
    address: string;
  };
  vaccine: {
    id: string;
    name: string;
  };
  date: string;
  slot: string;
};
