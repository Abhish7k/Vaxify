import AdminHospitalCard from "./AdminHospitalCard";
import EmptyAdminHospitalsState from "./EmptyAdminHospitalsState";
import type { AdminHospital, HospitalStatus } from "@/types/admin-hospital";
import { AdminHospitalsSkeleton } from "@/components/skeletons/AdminHospitalsSkeleton";

type Props = {
  hospitals: AdminHospital[];
  activeStatus: HospitalStatus;
  isLoading?: boolean;
  onApproveHospital: (hospital: AdminHospital) => void;
  onRejectHospital: (hospital: AdminHospital) => void;
  onDeleteHospital: (hospital: AdminHospital) => void;
};

export default function AdminHospitalsListSection({
  hospitals,
  activeStatus,
  isLoading,
  onApproveHospital,
  onRejectHospital,
  onDeleteHospital,
}: Props) {
  if (isLoading) {
    return <AdminHospitalsSkeleton />;
  }
  const filteredHospitals = hospitals.filter(
    (hospital) => hospital.status === activeStatus,
  );

  if (filteredHospitals.length === 0) {
    return <EmptyAdminHospitalsState status={activeStatus} />;
  }

  return (
    <div className="space-y-4">
      {filteredHospitals.map((hospital) => (
        <AdminHospitalCard
          key={hospital.id}
          hospital={hospital}
          onApprove={() => onApproveHospital(hospital)}
          onReject={() => onRejectHospital(hospital)}
          onDelete={() => onDeleteHospital(hospital)}
        />
      ))}
    </div>
  );
}
