import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { UserAppointmentTab } from "@/types/appointment";

type Props = {
  value: UserAppointmentTab;
  onChange: (value: UserAppointmentTab) => void;
};

export default function MyAppointmentsTabsSection({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(val) => onChange(val as UserAppointmentTab)}>
      <TabsList className="">
        <TabsTrigger value="BOOKED">Upcoming</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        <TabsTrigger value="MISSED">Missed</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
