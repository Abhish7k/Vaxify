import { Building2, MapPin, User, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { AdminHospital } from "./types";
import AppointmentStatusBadge from "@/components/appointment/my-appointments/AppointmentStatusBadge";
import AdminHospitalCardActions from "./AdminHospitalCardActions";

type Props = {
  hospital: AdminHospital;
  onApprove: () => void;
  onReject: () => void;
};

export default function AdminHospitalCard({
  hospital,
  onApprove,
  onReject,
}: Props) {
  return (
    <div
      className="
        w-full rounded-xl border bg-background
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-md
      "
    >
      <div className="p-6 space-y-5">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          {/* left */}
          <div className="min-w-0 space-y-4">
            {/* hospital */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="font-medium truncate">{hospital.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{hospital.address}</span>
                </div>
              </div>
            </div>

            {/* staff */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium">{hospital.staffName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{hospital.staffEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* status */}
          <AppointmentStatusBadge status={hospital.status} />
        </div>

        {/* separator */}
        <div className="border-t" />

        {/* footer */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to={`/admin/hospitals/${hospital.id}`}
            className="
              inline-flex items-center gap-1 text-sm font-medium
              text-muted-foreground transition-colors
              hover:text-foreground
              group
            "
          >
            View Hospital
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {hospital.status === "PENDING" && (
            <AdminHospitalCardActions
              hospitalName={hospital.name}
              status={hospital.status}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
