import AdminHospitalFloatingActions from "@/components/admin/hospital-details-page/AdminHospitalActionsSection";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import MainSection from "@/components/admin/hospital-details-page/AdminHospitalDetailsMainSection";
import { hospitalApi } from "@/api/hospital.api";
import { Loader2 } from "lucide-react";
import { toastUtils } from "@/lib/toast";

export default function AdminHospitalDetailsPage() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      if (!hospitalId) return;
      try {
        setLoading(true);

        const data = await hospitalApi.getHospitalById(hospitalId);

        setHospital(data);
      } catch (error) {
        console.error("Failed to fetch hospital details", error);

        toast.error("Failed to load hospital details");
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [hospitalId]);

  const handleApproveHospital = async () => {
    if (!hospitalId) return;
    try {
      await hospitalApi.approveHospital(hospitalId);

      setHospital((prev: any) => ({
        ...prev,
        status: "APPROVED",
      }));

      toastUtils.success("Approved hospital successfully");
    } catch (error) {
      toastUtils.error("Failed to approve hospital");
    }
  };

  const handleRejectHospital = async () => {
    if (!hospitalId) return;

    try {
      await hospitalApi.rejectHospital(hospitalId);

      setHospital((prev: any) => ({
        ...prev,
        status: "REJECTED",
      }));

      toastUtils.error("Rejected hospital successfully");
    } catch (error) {
      toastUtils.error("Failed to reject hospital");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Hospital not found</p>
        <button onClick={() => window.history.back()} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-5 md:px-10 mb-20">
      <MainSection hospital={hospital} />

      <AdminHospitalFloatingActions
        hospitalName={hospital.name}
        status={hospital.status}
        onApprove={handleApproveHospital}
        onReject={handleRejectHospital}
      />
    </div>
  );
}
