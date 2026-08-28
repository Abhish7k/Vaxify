import AdminHospitalFloatingActions from "@/components/admin/hospital-details-page/AdminHospitalActionsSection";
import { useParams } from "react-router-dom";
import MainSection from "@/components/admin/hospital-details-page/AdminHospitalDetailsMainSection";
import { Loader2 } from "lucide-react";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  useApproveHospital,
  useAdminHospital,
  useRejectHospital,
} from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { isNotFoundError } from "@/lib/errors";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function AdminHospitalDetailsPage() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const hospitalQuery = useAdminHospital(hospitalId);
  const approveHospital = useApproveHospital();
  const rejectHospital = useRejectHospital();
  const hospital = hospitalQuery.data;
  const loading = hospitalQuery.isPending;

  const notFound = isNotFoundError(hospitalQuery.error);

  useQueryErrorToast(
    hospitalQuery.isError && !notFound,
    "Failed to load hospital details",
    hospitalQuery.error,
  );

  const handleApproveHospital = async () => {
    if (!hospitalId) return;
    try {
      await approveHospital.mutateAsync(hospitalId);

      toastUtils.success("Approved hospital successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to approve hospital"));
    }
  };

  const handleRejectHospital = async () => {
    if (!hospitalId) return;

    try {
      await rejectHospital.mutateAsync(hospitalId);

      toastUtils.success("Rejected hospital successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to reject hospital"));
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
    if (hospitalQuery.isError && !notFound) {
      return (
        <div className="flex h-[60vh] items-center justify-center px-4">
          <PageLoadError
            message="Could not load hospital details. Please try again."
            onRetry={() => void hospitalQuery.refetch()}
          />
        </div>
      );
    }

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
        isPending={approveHospital.isPending || rejectHospital.isPending}
      />
    </div>
  );
}
