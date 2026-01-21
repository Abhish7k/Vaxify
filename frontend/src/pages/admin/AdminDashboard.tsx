import AdminDashboardChartsSection from "@/components/dashboards/admin/AdminDashboardChartsSection";
import AdminDashboardStatsGrid from "@/components/dashboards/admin/AdminDashboardStatsGrid";

const AdminDashboard = () => {
  return (
    <div>
      {/* header */}
      <div className="mb-10">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform-level overview and system management
        </p>
      </div>

      {/*  */}
      <AdminDashboardStatsGrid />

      {/*  */}
      <AdminDashboardChartsSection />
    </div>
  );
};

export default AdminDashboard;
