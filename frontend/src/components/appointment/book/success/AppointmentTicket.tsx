import * as React from "react";
import { MapPin, Syringe, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AppointmentBookingSuccess({
  appointmentId,
  center,
  vaccine,
  date,
  slot,
}: AppointmentTicketProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md",
        "shadow-xl rounded-2xl animate-in fade-in zoom-in-95 duration-500",
      )}
    >
      {/* header */}
      <div className="p-8 flex flex-col items-center text-center">
        <div className="p-3 bg-green-500/10 rounded-full">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mt-4 text-xl font-semibold">Appointment Confirmed</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Your vaccination appointment has been booked successfully
        </p>
      </div>

      {/* content */}
      <div className="px-8 pb-8 space-y-5">
        <DashedLine />

        {/* appointment id */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase text-muted-foreground">
            Appointment ID
          </p>
          <p className="font-mono font-medium">{appointmentId}</p>
        </div>

        {/* center */}
        <div className="flex gap-2">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />

          <div>
            <p className="font-medium">{center.name}</p>
            <p className="text-sm text-muted-foreground">{center.address}</p>
          </div>
        </div>

        {/* vaccine */}
        <div className="flex items-center gap-2">
          <Syringe className="h-4 w-4 text-muted-foreground" />
          <p className="font-medium">{vaccine.name}</p>
        </div>

        {/* date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="font-medium">
            {new Date(date).toDateString()} • {slot}
          </p>
        </div>

        <DashedLine />

        {/* actions */}
        <div className="pt-4 flex flex-col gap-3">
          <Link to="/appointments">
            <Button
              variant="outline"
              className="w-full cursor-pointer active:scale-95 transition-all"
            >
              View My Appointments
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button
              variant="outline"
              className="w-full cursor-pointer active:scale-95 transition-all"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// helper funcs
const DashedLine = () => (
  <div className="w-full border-t-2 border-dashed border-border" />
);

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

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
