import { useState, useEffect, useMemo } from "react";
import { vaccineApi } from "@/api/vaccine.api";
import type { Vaccine } from "@/types/vaccine";
import { getVaccineColumns } from "@/components/dashboards/staff/vaccines/VaccineColumns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus, RefreshCcw, Syringe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StaffVaccinesPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const data = await vaccineApi.getVaccines();
      setVaccines(data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const { setOpen } = useSidebar();

  useEffect(() => {
    fetchVaccines();
  }, []);

  // auto-close sidebar on smaller screens for this page
  useEffect(() => {
    const handleResize = () => {
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

  const columns = useMemo(
    () =>
      getVaccineColumns({
        onUpdate: (v: Vaccine) => console.log("Update", v),
        onDelete: (v: Vaccine) => console.log("Delete", v),
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New Vaccine
          </Button>
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
    </div>
  );
}
