import { useState, useEffect, useMemo } from "react";
import type { Vaccine } from "@/types/vaccine";
import { getVaccineColumns } from "@/components/dashboards/staff/vaccines/VaccineColumns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import { RefreshCcw, Syringe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddVaccineDialog } from "@/components/dashboards/staff/vaccines/AddVaccineDialog";
import { DeleteVaccineDialog } from "@/components/dashboards/staff/vaccines/DeleteVaccineDialog";
import { UpdateStockDialog } from "@/components/dashboards/staff/vaccines/UpdateStockDialog";
import { useMyVaccines } from "@/hooks/queries/use-vaccines";
import { useMyHospital } from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function StaffVaccinesPage() {
  const hospitalQuery = useMyHospital();
  const vaccinesQuery = useMyVaccines();
  const vaccines = vaccinesQuery.data ?? [];
  const loading = vaccinesQuery.isFetching;
  const canMutate = hospitalQuery.data?.status === "APPROVED";
  const [vaccineToDelete, setVaccineToDelete] = useState<Vaccine | null>(null);
  const [vaccineToUpdate, setVaccineToUpdate] = useState<Vaccine | null>(null);

  useQueryErrorToast(
    vaccinesQuery.isError,
    "Failed to fetch vaccines",
    vaccinesQuery.error,
  );

  const { setOpen } = useSidebar();

  // auto-close sidebar on smaller screens for better ux
  useEffect(() => {
    const handleResize = () => {
      // close sidebar if screen width < 1300px
      if (window.innerWidth < 1300) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize(); // check on mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  // memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () =>
      getVaccineColumns({
        onUpdate: (v: Vaccine) => setVaccineToUpdate(v),
        onDelete: (v: Vaccine) => setVaccineToDelete(v),
        canMutate,
      }),
    [canMutate],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vaccine Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage vaccine stock and availability for your center.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void vaccinesQuery.refetch()}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {canMutate && <AddVaccineDialog />}
        </div>
      </div>
      <Card className="border-none shadow-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Syringe className="h-5 w-5 mr-2 text-primary" />
            Stock List
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!canMutate && hospitalQuery.data && (
            <p className="text-sm text-muted-foreground mb-4">
              Inventory can be changed after your hospital is approved.
            </p>
          )}
          {vaccinesQuery.isError ? (
            <PageLoadError
              message="Could not load vaccines. Please try again."
              onRetry={() => void vaccinesQuery.refetch()}
            />
          ) : loading ? (
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded-xl" />
              <div className="h-64 w-full bg-muted/50 animate-pulse rounded-xl" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={vaccines}
              searchKey="name"
              searchPlaceholder="Search vaccines..."
              pagination={false}
            />
          )}
        </CardContent>
      </Card>
      <DeleteVaccineDialog
        vaccine={vaccineToDelete}
        onClose={() => setVaccineToDelete(null)}
      />
      <UpdateStockDialog
        vaccine={vaccineToUpdate}
        onClose={() => setVaccineToUpdate(null)}
      />
    </div>
  );
}
