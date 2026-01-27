import AdminHospitalsHeaderSection from "@/components/admin/hospitals-page/AdminHospitalsHeaderSection";
import AdminHospitalsListSection from "@/components/admin/hospitals-page/AdminHospitalsListSection";

import { mockHospitals } from "@/components/admin/hospitals-page/mockdata";
import { useState } from "react";

import type {
  AdminHospital,
  HospitalStatus,
} from "@/components/admin/hospitals-page/types";
import AdminHospitalsTabsSection from "@/components/admin/hospitals-page/AdminHospitalsTabsSection";
import { toast } from "sonner";

const AdminHospitalsPage = () => {
  const [activeStatus, setActiveStatus] = useState<HospitalStatus>("PENDING");

  const [hospitals] = useState<AdminHospital[]>(mockHospitals);

  const handleApproveHospital = (hospital: AdminHospital) => {
    console.log("Approve:", hospital.id);

    toast.success("Approved hospital successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  const handleRejectHospital = (hospital: AdminHospital) => {
    console.log("Reject:", hospital.id);

    toast.error("Rejected hospital successfully", {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  };

  return (
    <div className="px-5 py-5 flex flex-col gap-10">
      {/* header */}
      <AdminHospitalsHeaderSection />

      {/* tabs */}
      <AdminHospitalsTabsSection
        value={activeStatus}
        onChange={setActiveStatus}
      />

      {/* list */}
      <AdminHospitalsListSection
        hospitals={hospitals}
        activeStatus={activeStatus}
        onApproveHospital={handleApproveHospital}
        onRejectHospital={handleRejectHospital}
      />
    </div>
  );
};

export default AdminHospitalsPage;
