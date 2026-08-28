import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VaccineAlertCard } from "@/components/dashboards/staff/alerts/VaccineAlertCard";
import { LowStockEmptyState } from "@/components/dashboards/staff/alerts/LowStockEmptyState";
import { useSidebar } from "@/components/ui/sidebar";
import { useMyVaccines } from "@/hooks/queries/use-vaccines";
import { useMyHospital } from "@/hooks/queries/use-hospitals";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { PageLoadError } from "@/components/ui/page-load-error";

export default function LowStockAlertsPage() {
  const vaccinesQuery = useMyVaccines();
  const hospitalQuery = useMyHospital();
  const vaccines = vaccinesQuery.data ?? [];
  const loading = vaccinesQuery.isFetching;
  const canMutate = hospitalQuery.data?.status === "APPROVED";

  const navigate = useNavigate();

  const { setOpen } = useSidebar();

  useQueryErrorToast(
    vaccinesQuery.isError,
    "Failed to fetch vaccines",
    vaccinesQuery.error,
  );

  // sidebar toggle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  const getPercentage = (stock: number, capacity: number) => {
    if (capacity === 0) return 0;
    return (stock / capacity) * 100;
  };

  const criticalVaccines = vaccines.filter((v) => {
    const pct = getPercentage(v.stock, v.capacity);
    return pct < 20;
  });

  const warningVaccines = vaccines.filter((v) => {
    const pct = getPercentage(v.stock, v.capacity);
    return pct >= 20 && pct < 40;
  });

  const hasAlerts = criticalVaccines.length > 0 || warningVaccines.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <img src="https://ik.imagekit.io/vaxify/icons/alert.png" alt="" aria-hidden="true" className="h-10 w-10" />
            Stock Alerts
          </h1>

          <p className="text-muted-foreground mt-1">
            Monitor critical inventory levels and actions required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => void vaccinesQuery.refetch()}
            disabled={loading}
            className="h-10 w-full sm:w-auto"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Button onClick={() => navigate("/staff/vaccines")} className="h-10 w-full sm:w-auto">
            Manage Inventory
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 w-full bg-muted animate-pulse rounded-xl" />

          <div className="h-32 w-full bg-muted/60 animate-pulse rounded-xl" />
        </div>
      ) : vaccinesQuery.isError ? (
        <PageLoadError
          message="Could not load stock alerts. Please try again."
          onRetry={() => void vaccinesQuery.refetch()}
        />
      ) : !hasAlerts ? (
        <LowStockEmptyState />
      ) : (
        <div className="grid gap-10">
          {/* critical */}
          {criticalVaccines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">Critical (&lt; 20%)</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {criticalVaccines.map((vaccine) => (
                  <VaccineAlertCard
                    key={vaccine.id}
                    vaccine={vaccine}
                    type="critical"
                    onRestockClick={canMutate ? () => navigate("/staff/vaccines") : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* warning */}
          {warningVaccines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">Warnings (&lt; 40%)</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {warningVaccines.map((vaccine) => (
                  <VaccineAlertCard
                    key={vaccine.id}
                    vaccine={vaccine}
                    type="warning"
                    onRestockClick={canMutate ? () => navigate("/staff/vaccines") : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
