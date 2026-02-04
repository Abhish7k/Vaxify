import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/appointment";
import {
  format,
  subDays,
  parseISO,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

const chartConfig = {
  value: {
    label: "Appointments",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

interface StaffAppointmentsTrendLineProps {
  appointments: Appointment[];
  loading: boolean;
}

export const StaffAppointmentsTrendLine = ({
  appointments,
  loading,
}: StaffAppointmentsTrendLineProps) => {
  const isDemoData = appointments.length === 0;

  const chartData = React.useMemo(() => {
    // aggregation: divide 30 days into 6 buckets of 5 days each
    const buckets = Array.from({ length: 6 }).map((_, i) => {
      const end = subDays(new Date(), (5 - i) * 5);
      const start = subDays(end, 4);
      return {
        start: startOfDay(start),
        end: endOfDay(end),
        period: `${format(start, "d")}-${format(end, "d MMM")}`,
        // sample values for visual layout
        value: isDemoData ? Math.floor(Math.random() * 50) + 30 : 0,
      };
    });

    if (!isDemoData) {
      appointments.forEach((a) => {
        const aptDate = parseISO(a.date);
        buckets.forEach((b) => {
          if (isWithinInterval(aptDate, { start: b.start, end: b.end })) {
            b.value++;
          }
        });
      });
    }

    return buckets;
  }, [appointments, isDemoData]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="col-span-12 lg:col-span-8 relative overflow-hidden">
      {isDemoData && !loading && (
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant="secondary"
            className="gap-1 bg-amber-100/50 text-amber-700 border-amber-200 backdrop-blur-sm"
          >
            <Info className="h-3 w-3" />
            Sample Data
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="font-medium">Appointments Trend</CardTitle>
      </CardHeader>

      <CardContent className="px-0 min-h-[400px]">
        {loading ? (
          <div className="flex h-80 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-8 px-5">
              <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Last 30 Days
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold font-mono">{total}</div>
              </div>
            </div>

            <ChartContainer
              config={chartConfig}
              className="h-80 w-full ps-1.5 pe-4 overflow-visible"
            >
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient
                    id="appointmentsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 12"
                  vertical={false}
                  className="stroke-muted/50"
                />

                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  className="text-[10px] font-medium text-muted-foreground"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  domain={[0, (dataMax: number) => Math.max(40, dataMax + 10)]}
                  className="text-[10px] font-medium text-muted-foreground"
                />

                <ChartTooltip
                  content={<AppointmentsTooltip active={false} payload={[]} />}
                  cursor={{
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#appointmentsGradient)"
                  stroke="transparent"
                  animationDuration={1500}
                />

                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#3b82f6",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
};

function AppointmentsTooltip({
  active,
  payload,
}: {
  active: boolean;
  payload: any[];
}) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    if (!data) return null;

    return (
      <div className="rounded-xl bg-background/95 backdrop-blur-md p-3 shadow-xl border border-border min-w-[120px]">
        <div className="mb-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex justify-between items-center gap-4">
          <span>Appointments</span>
          <span className="text-primary font-mono">{data.period}</span>
        </div>
        <div className="h-px w-full bg-border/50 mb-2" />
        <div className="text-2xl font-black text-primary tracking-tighter">
          {data.value}
        </div>
      </div>
    );
  }
  return null;
}
