import AdminHospitalsHeaderSection from "@/components/admin/hospitals-page/AdminHospitalsHeaderSection";
import AdminHospitalsListSection from "@/components/admin/hospitals-page/AdminHospitalsListSection";

import { hospitalApi } from "@/api/hospital.api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type {
  AdminHospital,
  HospitalStatus,
} from "@/components/admin/hospitals-page/types";
import AdminHospitalsTabsSection from "@/components/admin/hospitals-page/AdminHospitalsTabsSection";
import { toast } from "sonner";

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
      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      const [data] = await Promise.all([
        hospitalApi.getAdminHospitals(),
        minDelay,
      ]);
      setHospitals(data);
    } catch (error) {
      toast.error("Failed to load hospitals", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
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
      toast.success("Approved hospital successfully", {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      fetchHospitals(); // refresh
    } catch (error) {
      toast.error("Failed to approve hospital", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
    }
  };

  const handleRejectHospital = async (hospital: AdminHospital) => {
    try {
      await hospitalApi.rejectHospital(hospital.id);

      toast.success("Rejected hospital successfully", {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      fetchHospitals(); // refresh
    } catch (error) {
      toast.error("Failed to reject hospital", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
    }
  };

  const handleDeleteHospital = async (hospital: AdminHospital) => {
    try {
      await hospitalApi.deleteHospital(hospital.id);

      toast.success("Deleted hospital and associated staff account", {
        style: {
          backgroundColor: "#e7f9ed",
          color: "#0f7a28",
        },
      });

      fetchHospitals(); // refresh
    } catch (error) {
      toast.error("Failed to delete hospital", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
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
        <AdminHospitalsHeaderSection
          loading={loading}
          onRefresh={fetchHospitals}
        />
      </motion.div>

      {/* tabs */}
      <motion.div variants={item}>
        <AdminHospitalsTabsSection
          value={activeStatus}
          onChange={setActiveStatus}
        />
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
