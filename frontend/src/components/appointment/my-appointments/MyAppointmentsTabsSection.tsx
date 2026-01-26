import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AppointmentStatus = "BOOKED" | "COMPLETED" | "CANCELLED";

type Props = {
  value: AppointmentStatus;
  onChange: (value: AppointmentStatus) => void;
};

export default function MyAppointmentsTabsSection({ value, onChange }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(val) => onChange(val as AppointmentStatus)}
    >
      <TabsList className="">
        <TabsTrigger value="BOOKED">Upcoming</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
