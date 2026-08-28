import AdminHospitalsHeaderSection from "@/components/admin/hospitals-page/AdminHospitalsHeaderSection";
import AdminHospitalsListSection from "@/components/admin/hospitals-page/AdminHospitalsListSection";

import { useState } from "react";
import { motion } from "framer-motion";

import type { AdminHospital, HospitalStatus } from "@/types/admin-hospital";
import AdminHospitalsTabsSection from "@/components/admin/hospitals-page/AdminHospitalsTabsSection";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { fadeUpItemSlow, staggerContainer } from "@/lib/motion";
import {
  useAdminHospitals,
  useApproveHospital,
  useDeleteHospital,
  useRejectHospital,
} from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { PageLoadError } from "@/components/ui/page-load-error";

const AdminHospitalsPage = () => {
  const [activeStatus, setActiveStatus] = useState<HospitalStatus>("PENDING");
  const hospitalsQuery = useAdminHospitals();
  const approveHospital = useApproveHospital();
  const rejectHospital = useRejectHospital();
  const deleteHospital = useDeleteHospital();

  const hospitals = hospitalsQuery.data ?? [];
  const loading = hospitalsQuery.isFetching;

  useQueryErrorToast(
    hospitalsQuery.isError,
    "Failed to load hospitals",
    hospitalsQuery.error,
  );

  const handleApproveHospital = async (hospital: AdminHospital) => {
    try {
      await approveHospital.mutateAsync(hospital.id);

      toastUtils.success("Approved hospital successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to approve hospital"));
    }
  };

  const handleRejectHospital = async (hospital: AdminHospital) => {
    try {
      await rejectHospital.mutateAsync(hospital.id);

      toastUtils.success("Rejected hospital successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to reject hospital"));
    }
  };

  const handleDeleteHospital = async (hospital: AdminHospital) => {
    try {
      await deleteHospital.mutateAsync(hospital.id);

      toastUtils.success("Deleted hospital and associated staff account");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to delete hospital"));
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="px-5 py-5 md:px-10 flex flex-col gap-10"
    >
      {/* header */}
      <motion.div variants={fadeUpItemSlow}>
        <AdminHospitalsHeaderSection
          loading={loading}
          onRefresh={() => void hospitalsQuery.refetch()}
        />
      </motion.div>

      {/* tabs */}
      <motion.div variants={fadeUpItemSlow}>
        <AdminHospitalsTabsSection value={activeStatus} onChange={setActiveStatus} />
      </motion.div>

      {/* list */}
      <motion.div variants={fadeUpItemSlow}>
        {hospitalsQuery.isError && !loading ? (
          <PageLoadError
            message="Could not load hospitals. Please try again."
            onRetry={() => void hospitalsQuery.refetch()}
          />
        ) : (
        <AdminHospitalsListSection
          hospitals={hospitals}
          activeStatus={activeStatus}
          isLoading={loading}
          onApproveHospital={handleApproveHospital}
          onRejectHospital={handleRejectHospital}
          onDeleteHospital={handleDeleteHospital}
          isPending={
            approveHospital.isPending || rejectHospital.isPending || deleteHospital.isPending
          }
        />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminHospitalsPage;
