import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { toastUtils } from "@/lib/toast";

import { HospitalHeader } from "@/components/dashboards/staff/hospital/HospitalHeader";
import { HospitalDetailsCard } from "@/components/dashboards/staff/hospital/HospitalDetailsCard";
import { HospitalStatusCard } from "@/components/dashboards/staff/hospital/HospitalStatusCard";
import { EditHospitalDialog } from "@/components/dashboards/staff/hospital/EditHospitalDialog";
import { HospitalDocumentCard } from "@/components/dashboards/staff/hospital/HospitalDocumentCard";
import { useMyHospital, useUpdateMyHospital } from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { getErrorMessage } from "@/lib/errors";
import { PageLoadError } from "@/components/ui/page-load-error";
import type { UpdateHospitalRequest } from "@/types/hospital";

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

const emptyForm: UpdateHospitalRequest = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  documentUrl: "",
};

const MyHospitalPage = () => {
  const hospitalQuery = useMyHospital();
  const updateHospital = useUpdateMyHospital();
  const hospital = hospitalQuery.data;
  const isLoading = hospitalQuery.isPending;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useQueryErrorToast(
    hospitalQuery.isError,
    "Could not load hospital details",
    hospitalQuery.error,
  );

  useEffect(() => {
    if (!hospital) return;

    setFormData({
      name: hospital.name || "",
      address: hospital.address || "",
      city: hospital.city || "",
      state: hospital.state || "",
      pincode: hospital.pincode || "",
      documentUrl: hospital.documentUrl || "",
    });
  }, [hospital]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHospital.mutateAsync(formData);
      setIsEditDialogOpen(false);
      toastUtils.success("Hospital details updated successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to update hospital details"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-10/12 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
      </div>
    );
  }

  if (!hospital) {
    if (hospitalQuery.isError) {
      return (
        <PageLoadError
          message="Could not load hospital details. Please try again."
          onRetry={() => void hospitalQuery.refetch()}
        />
      );
    }

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
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <HospitalHeader
        name={hospital.name}
        status={hospital.status}
        onEditClick={() => setIsEditDialogOpen(true)}
        canEdit={hospital.status === "APPROVED"}
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
        isUpdating={updateHospital.isPending}
        onUpdate={handleUpdate}
      />
    </motion.div>
  );
};

export default MyHospitalPage;
