import { useState, useEffect, useMemo } from "react";
import { vaccineApi } from "@/api/vaccine.api";
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
import { toast } from "sonner";

export default function StaffVaccinesPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<Vaccine | null>(null);
  const [vaccineToUpdate, setVaccineToUpdate] = useState<Vaccine | null>(null);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const data = await vaccineApi.getVaccines();

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

  const { setOpen } = useSidebar();

  useEffect(() => {
    fetchVaccines();
  }, []);

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
      }),
    [],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Vaccine Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage vaccine stock and availability for your center.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVaccines}
            disabled={loading}
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <AddVaccineDialog onSuccess={fetchVaccines} />
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
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-64 w-full bg-muted/50 animate-pulse rounded" />
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
        onSuccess={fetchVaccines}
      />

      <UpdateStockDialog
        vaccine={vaccineToUpdate}
        onClose={() => setVaccineToUpdate(null)}
        onSuccess={fetchVaccines}
      />
    </div>
  );
}
