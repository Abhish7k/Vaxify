import { useEffect, useMemo, useState } from "react";
import { Clock, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { toastUtils } from "@/lib/toast";

import { type Slot } from "@/api/slots.api";
import { BulkCreateSlotDialog } from "@/components/dashboards/staff/slots/BulkCreateSlotDialog";
import { CreateSlotDialog } from "@/components/dashboards/staff/slots/CreateSlotDialog";
import { DeleteSlotDialog } from "@/components/dashboards/staff/slots/DeleteSlotDialog";
import { getSlotColumns } from "@/components/dashboards/staff/slots/SlotColumns";
import { useMyHospital } from "@/hooks/queries/use-hospitals";
import { useDeleteSlot, useHospitalSlots } from "@/hooks/queries/use-slots";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function StaffSlotsPage() {
  const hospitalQuery = useMyHospital();
  const hospitalId = hospitalQuery.data?.id ? String(hospitalQuery.data.id) : null;
  const slotsQuery = useHospitalSlots(hospitalId ?? undefined);
  const deleteSlot = useDeleteSlot();

  const loading = hospitalQuery.isLoading || slotsQuery.isFetching;
  const slots = slotsQuery.data ?? [];
  const canMutate = hospitalQuery.data?.status === "APPROVED";
  const loadError = hospitalQuery.isError || slotsQuery.isError;

  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  useQueryErrorToast(hospitalQuery.isError, "Failed to load hospital details", hospitalQuery.error);
  useQueryErrorToast(slotsQuery.isError, "Failed to fetch slots", slotsQuery.error);

  useEffect(() => {
    if (hospitalQuery.isSuccess && !hospitalQuery.data?.id) {
      toastUtils.error("No hospital found for your account");
    }
  }, [hospitalQuery.isSuccess, hospitalQuery.data]);

  const confirmDelete = async () => {
    if (!slotToDelete) return;

    try {
      await deleteSlot.mutateAsync(slotToDelete.id);
      toastUtils.success("Slot deleted successfully");
    } catch (error) {
      toastUtils.error(getErrorMessage(error, "Failed to delete slot"));
    } finally {
      setIsDeleteAlertOpen(false);
      setSlotToDelete(null);
    }
  };

  const columns = useMemo(
    () =>
      getSlotColumns({
        onDelete: (slot) => {
          setSlotToDelete(slot);
          setIsDeleteAlertOpen(true);
        },
        canMutate: hospitalQuery.data?.status === "APPROVED",
      }),
    [hospitalQuery.data?.status],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointment Slots</h1>
          <p className="text-sm text-muted-foreground">Manage availability for your vaccination center</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void slotsQuery.refetch()}
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>

          {canMutate && (
            <>
              <BulkCreateSlotDialog hospitalId={hospitalId} onSuccess={() => void slotsQuery.refetch()} />
              <CreateSlotDialog hospitalId={hospitalId} />
            </>
          )}
        </div>
      </div>

      <Card className="border-none shadow-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Active Slots
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!canMutate && hospitalQuery.data && (
            <p className="text-sm text-muted-foreground mb-4">
              Slots can be created after your hospital is approved.
            </p>
          )}
          {loadError ? (
            <PageLoadError
              message="Could not load slots. Please try again."
              onRetry={() => {
                void hospitalQuery.refetch();
                void slotsQuery.refetch();
              }}
            />
          ) : (
          <DataTable
            columns={columns}
            data={slots}
            searchKey="date"
            searchPlaceholder="Search by date..."
            loading={loading}
            pagination={true}
          />
          )}
        </CardContent>
      </Card>

      <DeleteSlotDialog
        open={isDeleteAlertOpen}
        isPending={deleteSlot.isPending}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
