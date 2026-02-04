import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";
import type { Appointment } from "@/types/appointment";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

import { subDays, isAfter, parseISO } from "date-fns";

const chartConfig = {
  Scheduled: {
    label: "Scheduled",
    color: "#3b82f6",
  },
  Completed: {
    label: "Completed",
    color: "#10b981",
  },
  Cancelled: {
    label: "Cancelled",
    color: "#ef4444",
  },
} satisfies ChartConfig;

interface StaffAppointmentStatusPieProps {
  appointments: Appointment[];
  loading: boolean;
}

export function StaffAppointmentStatusPie({
  appointments,
  loading,
}: StaffAppointmentStatusPieProps) {
  const isDemo = appointments.length === 0;

  const data = React.useMemo(() => {
    if (isDemo) {
      return [
        { name: "Scheduled", value: 45 },
        { name: "Completed", value: 30 },
        { name: "Cancelled", value: 15 },
      ];
    }

    const thirtyDaysAgo = subDays(new Date(), 30);
    const counts = {
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
    };

    appointments.forEach((a) => {
      const aptDate = parseISO(a.date);
      // filter for last 30 days
      if (isAfter(aptDate, thirtyDaysAgo)) {
        const status = a.status.toUpperCase();
        if (
          status === "BOOKED" ||
          status === "UPCOMING" ||
          status === "SCHEDULED"
        ) {
          counts.Scheduled++;
        } else if (status === "COMPLETED") {
          counts.Completed++;
        } else if (status === "CANCELLED") {
          counts.Cancelled++;
        }
      }
    });

    return [
      { name: "Scheduled", value: counts.Scheduled },
      { name: "Completed", value: counts.Completed },
      { name: "Cancelled", value: counts.Cancelled },
    ];
  }, [appointments, isDemo]);

  const total = React.useMemo(
    () => (isDemo ? 0 : data.reduce((sum, d) => sum + d.value, 0)),
    [data, isDemo],
  );

  return (
    <Card className="flex flex-col col-span-12 lg:col-span-4 relative overflow-hidden">
      {isDemo && !loading && (
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200"
          >
            Preview
          </Badge>
        </div>
      )}

      <CardHeader className="items-center pb-0">
        <CardTitle className="font-medium">Status Distribution</CardTitle>
        <CardDescription>Metrics for the last 30 days</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="mx-auto aspect-square max-h-62.5 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-62.5"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={8}
                cornerRadius={6}
                stroke="none"
                animationDuration={1500}
                opacity={isDemo ? 0.5 : 1}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      chartConfig[entry.name as keyof typeof chartConfig]?.color
                    }
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const cx = viewBox.cx ?? 0;
                      const cy = viewBox.cy ?? 0;
                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={cx}
                            y={cy - 5}
                            className="fill-foreground text-4xl font-extrabold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 25}
                            className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest"
                          >
                            Last 30 Days
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-4 pb-6 leading-none">
        <div className="flex items-center gap-2 font-semibold text-primary">
          {isDemo ? "Sample Distribution" : "Rolling 30-Day Window"}
        </div>
        <div className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed line-clamp-2">
          Real-time breakdown of patient vaccination statuses for the current
          month.
        </div>
      </CardFooter>
    </Card>
  );
}
