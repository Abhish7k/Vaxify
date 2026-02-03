import { useState, useEffect } from "react";
import { vaccineApi } from "@/api/vaccine.api";
import type { Vaccine } from "@/types/vaccine";
import { Button } from "@/components/ui/button";
import { RefreshCcw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { VaccineAlertCard } from "@/components/dashboards/staff/alerts/VaccineAlertCard";
import { LowStockEmptyState } from "@/components/dashboards/staff/alerts/LowStockEmptyState";
import { useSidebar } from "@/components/ui/sidebar";

export default function LowStockAlertsPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { setOpen } = useSidebar();

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const data = await vaccineApi.getMyVaccines();
      setVaccines(data);
    } catch (error) {
      console.error("Fetch failed", error);
      toast.error("Failed to fetch vaccines", {
        style: {
          backgroundColor: "#ffe5e5",
          color: "#b00000",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await vaccineApi.getMyVaccines();

      await new Promise((resolve) => setTimeout(resolve, 500));

      setVaccines(data);
    } catch (error) {
      console.error("Fetch failed", error);

      toast.error("Failed to fetch vaccines", {
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
    fetchVaccines();
  }, []);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <img
              src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-rYQA0MBt7kN6Ap9xch2dYMInv4FzEX.png&w=1000&q=75"
              alt=""
              className="h-10 w-10"
            />
            Stock Alerts
          </h1>

          <p className="text-muted-foreground mt-1">
            Monitor critical inventory levels and actions required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 w-full sm:w-auto"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
          <Button
            onClick={() => navigate("/staff/vaccines")}
            className="h-10 w-full sm:w-auto"
          >
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
                    onRestockClick={() => navigate("/staff/vaccines")}
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
                    onRestockClick={() => navigate("/staff/vaccines")}
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
