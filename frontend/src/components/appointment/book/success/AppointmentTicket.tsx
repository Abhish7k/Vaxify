import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TicketCard } from "../../TicketCard";

export type AppointmentTicketProps = {
  appointmentId: string;
  center: {
    name: string;
    address: string;
  };
  vaccine: {
    name: string;
  };
  date: string;
  slot: string;
};

export function AppointmentBookingSuccess(props: AppointmentTicketProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 w-full max-w-md",
        "animate-in fade-in zoom-in-95 duration-500 mt-10",
      )}
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Booking Confirmed!</h1>
        <p className="text-muted-foreground">Your appointment has been successfully scheduled.</p>
      </div>

      <div className="w-full mt-4">
        <TicketCard {...props} />
      </div>

      <div className="flex flex-col w-full gap-3 pt-4">
        <Link to="/appointments">
          <Button
            variant="default"
            size="lg"
            className="w-full cursor-pointer active:scale-95 transition-all"
          >
            View My Appointments
          </Button>
        </Link>

        <Link to="/dashboard">
          <Button variant="outline" className="w-full cursor-pointer active:scale-95 transition-all">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
