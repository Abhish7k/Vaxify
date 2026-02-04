import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Avvvatars from "avvvatars-react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Appointment } from "@/types/appointment";

interface StaffDashboardRecentVaccinationsCardComponentProps {
  appointments: Appointment[];
  loading: boolean;
}

export const StaffDashboardRecentVaccinationsCardComponent = ({
  appointments,
  loading,
}: StaffDashboardRecentVaccinationsCardComponentProps) => {
  // filter for completed status and slice for recent 4
  const recentList = appointments
    .filter((a) => a.status === "COMPLETED")
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-medium">Recent Vaccinations</CardTitle>

        <Link to="/staff/appointments">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer active:scale-95 transition-all group"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-all duration-300" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 pb-5 border-b border-dashed last:border-none animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : recentList.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm italic">
            No recent vaccinations.
          </div>
        ) : (
          recentList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between pb-5 border-b border-dashed last:border-none"
            >
              <div className="flex items-center gap-3 text-left">
                <Avatar>
                  <AvatarImage src={""} />
                  <AvatarFallback>
                    <Avvvatars
                      value={item.patientName || "User"}
                      style="shape"
                    />
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.vaccine || item.vaccineName}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground font-mono">
                {item.date}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
