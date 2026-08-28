import type { Vaccine } from "@/types/vaccine";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface VaccineAlertCardProps {
  vaccine: Vaccine;
  type: "critical" | "warning";
  onRestockClick?: () => void;
}

export function VaccineAlertCard({
  vaccine,
  type,
  onRestockClick,
}: VaccineAlertCardProps) {
  const getPercentage = (stock: number, capacity: number) => {
    if (capacity === 0) return 0;

    return (stock / capacity) * 100;
  };

  const pct = getPercentage(vaccine.stock, vaccine.capacity);

  const isCritical = type === "critical";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-2">
            <CardTitle className="mb-2 truncate">{vaccine.name}</CardTitle>
            <CardDescription className="truncate">
              {vaccine.manufacturer}
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className={
              isCritical
                ? "text-red-600 border-red-200 bg-red-50/50"
                : "text-orange-600 border-orange-200 bg-orange-50/50"
            }
          >
            {isCritical ? "Critical" : "Low Stock"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className={isCritical ? "text-red-600 font-semibold" : ""}>
              {vaccine.stock} doses left
            </span>

            <span className="text-muted-foreground">
              Capacity: {vaccine.capacity}
            </span>
          </div>

          <Progress
            value={pct}
            className={isCritical ? "h-1.5 bg-red-100/50" : "h-1.5"}
            indicatorClassName={isCritical ? "bg-red-500" : "bg-orange-500"}
          />

          <div className="pt-2">
            {isCritical ? (
              <div className="space-y-2">
                <p className="text-xs text-red-500 font-medium flex items-center justify-center bg-red-50 p-2 rounded-md border border-red-100">
                  Stock is critically low. Restock soon.
                </p>

                {onRestockClick && (
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={onRestockClick}
                  variant="outline"
                >
                  Add Stock
                </Button>
                )}
              </div>
            ) : (
              onRestockClick && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={onRestockClick}
              >
                Restock
              </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
