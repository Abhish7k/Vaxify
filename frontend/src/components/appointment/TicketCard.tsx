import { cn } from "@/lib/utils";
import { CheckCircleIcon, MapPin, Syringe } from "lucide-react";

export type TicketCardProps = {
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
  className?: string;
  status?: "scheduled" | "completed" | "cancelled";
};

export function TicketCard({
  appointmentId,
  center,
  vaccine,
  date,
  slot,
  className,
  status = "scheduled",
}: TicketCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "relative w-full max-w-sm mx-auto bg-card text-card-foreground rounded-2xl shadow-lg font-sans z-10 overflow-hidden border",
        className,
      )}
    >
      {/* header section */}
      <div className="p-8 flex flex-col items-center text-center">
        <div className="p-4 bg-green-500/10 rounded-full">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-xl font-semibold mt-4">Vaccination Ticket</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Appointment Confirmed
        </p>
      </div>

      {/* content */}
      <div className="px-8 pb-8 space-y-6">
        <DashedLine />

        {/* info grid */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Reference
            </p>
            <p className="font-mono font-medium text-sm mt-1">
              {appointmentId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Status
            </p>
            <p className="font-semibold text-sm mt-1 capitalize">{status}</p>
          </div>
        </div>

        {/* date row */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Date & Time
          </p>
          <p className="font-medium mt-1">
            {formattedDate} • {slot}
          </p>
        </div>

        {/* center/vaccine box */}
        <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
          <div className="p-2 bg-background rounded-md shadow-sm shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{center.name}</p>
            <p className="text-muted-foreground text-xs mt-0.5 truncate">
              {center.address}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex items-center space-x-3 -mt-2">
          <div className="p-2 bg-background rounded-md shadow-sm shrink-0">
            <Syringe className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{vaccine.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

//  helper components
const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-border"
    aria-hidden="true"
  />
);
