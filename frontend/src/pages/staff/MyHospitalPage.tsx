import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { hospitalApi } from "@/api/hospital.api";
import { toast } from "sonner";

import { HospitalHeader } from "@/components/dashboards/staff/hospital/HospitalHeader";
import { HospitalDetailsCard } from "@/components/dashboards/staff/hospital/HospitalDetailsCard";
import { HospitalStatusCard } from "@/components/dashboards/staff/hospital/HospitalStatusCard";
import { EditHospitalDialog } from "@/components/dashboards/staff/hospital/EditHospitalDialog";
import { HospitalDocumentCard } from "@/components/dashboards/staff/hospital/HospitalDocumentCard";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const MyHospitalPage = () => {
  const [hospital, setHospital] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    documentUrl: "",
  });

  const fetchMyHospital = async () => {
    try {
      setIsLoading(true);
      const data = await hospitalApi.getMyHospital();
      setHospital(data);
      // Initialize form data
      setFormData({
        name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        documentUrl: data.documentUrl || "",
      });
    } catch (error) {
      console.error("Failed to fetch hospital details:", error);
      toast.error("Could not load hospital details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHospital();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting update data:", formData);
    try {
      setIsUpdating(true);
      const updatedData = await hospitalApi.updateHospital(formData);
      setHospital(updatedData);
      setIsEditDialogOpen(false);
      toast.success("Hospital details updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update hospital details");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">No Hospital Registered</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't find any hospital linked to your account.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-5xl mx-auto space-y-8"
    >
      <HospitalHeader
        name={hospital.name}
        status={hospital.status}
        onEditClick={() => setIsEditDialogOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <HospitalDetailsCard hospital={hospital} itemVariants={itemVariants} />

        <div className="space-y-6">
          <HospitalStatusCard status={hospital.status} />

          <HospitalDocumentCard documentUrl={hospital.documentUrl} />
        </div>
      </div>

      <EditHospitalDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        isUpdating={isUpdating}
        onUpdate={handleUpdate}
      />
    </motion.div>
  );
};

export default MyHospitalPage;
