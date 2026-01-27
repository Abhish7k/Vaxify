import AdminHospitalFloatingActions from "@/components/admin/hospital-details-page/AdminHospitalActionsSection";
import { mockHospitalDetails } from "@/components/admin/hospital-details-page/mockdata";
import { useState } from "react";
import { toast } from "sonner";
import MainSection from "./AdminHospitalDetailsMainSection";

export default function AdminHospitalDetailsPage() {
  const [hospital, setHospital] = useState(mockHospitalDetails);

  const handleApproveHospital = () => {
    setHospital((prev) => ({
      ...prev,
      status: "APPROVED",
    }));

    console.log("Approve:", hospital.id);

    toast.success("Approved hospital successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  const handleRejectHospital = () => {
    setHospital((prev) => ({
      ...prev,
      status: "REJECTED",
    }));

    console.log("Reject:", hospital.id);

    toast.error("Rejected hospital successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  return (
    <div className="px-5 py-5 md:px-10 mb-40">
      <MainSection />

      <AdminHospitalFloatingActions
        hospitalName={hospital.name}
        status={hospital.status}
        onApprove={handleApproveHospital}
        onReject={handleRejectHospital}
      />
    </div>
  );
}
