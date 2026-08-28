import { Clock, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CenterData } from "@/types/center-details";

interface Props {
  center: CenterData;
}

const CenterDetailsOperatingInfoSection = ({ center }: Props) => {
  const hasLocation = Boolean(center.city || center.state || center.pincode);

  return (
    <div className="space-y-8">
      {hasLocation && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location</span>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              {center.city && (
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="font-medium">{center.city}</p>
                </div>
              )}
              {center.state && (
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="font-medium">{center.state}</p>
                </div>
              )}
              {center.pincode && (
                <div>
                  <p className="text-xs text-muted-foreground">Pincode</p>
                  <p className="font-medium">{center.pincode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {center.operatingHours?.weekdays && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Operating Hours</span>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">Mon – Sat</p>
              <p className="font-medium">{center.operatingHours.weekdays}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(center.phone || center.email) && (
        <Card>
          <CardContent className="p-6 space-y-5">
            {center.phone && (
              <div className="flex gap-3">
                <Phone className="w-4 h-4" />
                <span>{center.phone}</span>
              </div>
            )}

            {center.email && (
              <div className="flex gap-3">
                <Mail className="w-4 h-4" />
                <span className="break-all">{center.email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CenterDetailsOperatingInfoSection;
