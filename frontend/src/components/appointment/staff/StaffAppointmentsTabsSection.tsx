import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentStatus } from "@/types/appointment";

export type StaffAppointmentStatus = AppointmentStatus;

type Props = {
  value: StaffAppointmentStatus;
  onChange: (value: StaffAppointmentStatus) => void;
};

export default function StaffAppointmentsTabsSection({
  value,
  onChange,
}: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(val) => onChange(val as StaffAppointmentStatus)}
      className="mt-10"
    >
      <TabsList>
        <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
