import AdminHospitalsHeaderSection from "@/components/admin/hospitals-page/AdminHospitalsHeaderSection";
import AdminHospitalsListSection from "@/components/admin/hospitals-page/AdminHospitalsListSection";

import { hospitalApi } from "@/api/hospital.api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type { AdminHospital, HospitalStatus } from "@/types/admin-hospital";
import AdminHospitalsTabsSection from "@/components/admin/hospitals-page/AdminHospitalsTabsSection";
import { toastUtils } from "@/lib/toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

const AdminHospitalsPage = () => {
  const [activeStatus, setActiveStatus] = useState<HospitalStatus>("PENDING");
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);

    try {
      const data = await hospitalApi.getAdminHospitals();

      setHospitals(data);
    } catch (error) {
      toastUtils.error("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);

    try {
      const data = await hospitalApi.getAdminHospitals();

      setHospitals(data);
    } catch (error) {
      toastUtils.error("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleApproveHospital = async (hospital: AdminHospital) => {
    try {
      await hospitalApi.approveHospital(hospital.id);

      toastUtils.success("Approved hospital successfully");

      fetchHospitals(); // refresh
    } catch (error) {
      toastUtils.error("Failed to approve hospital");
    }
  };

  const handleRejectHospital = async (hospital: AdminHospital) => {
    try {
      await hospitalApi.rejectHospital(hospital.id);

      toastUtils.success("Rejected hospital successfully");

      fetchHospitals(); // refresh
    } catch (error) {
      toastUtils.error("Failed to reject hospital");
    }
  };

  const handleDeleteHospital = async (hospital: AdminHospital) => {
    try {
      await hospitalApi.deleteHospital(hospital.id);

      toastUtils.success("Deleted hospital and associated staff account");

      fetchHospitals(); // refresh
    } catch (error) {
      toastUtils.error("Failed to delete hospital");
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 py-5 md:px-10 flex flex-col gap-10"
    >
      {/* header */}
      <motion.div variants={item}>
        <AdminHospitalsHeaderSection loading={loading} onRefresh={handleRefresh} />
      </motion.div>

      {/* tabs */}
      <motion.div variants={item}>
        <AdminHospitalsTabsSection value={activeStatus} onChange={setActiveStatus} />
      </motion.div>

      {/* list */}
      <motion.div variants={item}>
        <AdminHospitalsListSection
          hospitals={hospitals}
          activeStatus={activeStatus}
          isLoading={loading}
          onApproveHospital={handleApproveHospital}
          onRejectHospital={handleRejectHospital}
          onDeleteHospital={handleDeleteHospital}
        />
      </motion.div>
    </motion.div>
  );
};

export default AdminHospitalsPage;
