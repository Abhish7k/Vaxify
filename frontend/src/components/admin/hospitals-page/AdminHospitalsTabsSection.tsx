import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type HospitalStatus } from "@/types/admin-hospital";

type Props = {
  value: HospitalStatus;
  onChange: (value: HospitalStatus) => void;
};

export default function AdminHospitalsTabsSection({ value, onChange }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(val) => onChange(val as HospitalStatus)}
    >
      <TabsList>
        <TabsTrigger value="PENDING">Pending</TabsTrigger>
        <TabsTrigger value="APPROVED">Approved</TabsTrigger>
        <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
