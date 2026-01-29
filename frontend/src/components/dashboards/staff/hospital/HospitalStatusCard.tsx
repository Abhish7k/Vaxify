import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HospitalStatusCardProps {
  status: string;
}

export const HospitalStatusCard = ({ status }: HospitalStatusCardProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 bg-emerald-50/20 overflow-hidden relative group">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <BadgeCheck className="h-4 w-4" />
            Verification Status
          </CardTitle>
        </CardHeader>

        <CardContent>
          {status === "APPROVED" ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-500 leading-relaxed">
              Your hospital is verified and public. Residents can now book
              appointments at your center.
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
              Your application is being reviewed. Our team will contact you if
              any further documents are required.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
