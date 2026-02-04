import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { copy, type HospitalStatus } from "@/types/admin-hospital";

type Props = {
  status: HospitalStatus;
};

export default function EmptyAdminHospitalsState({ status }: Props) {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <Building2 className="h-8 w-8 text-muted-foreground" />

        <h3 className="font-medium">{copy[status].title}</h3>

        <p className="text-sm text-muted-foreground max-w-sm">
          {copy[status].description}
        </p>
      </CardContent>
    </Card>
  );
}
