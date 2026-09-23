import AdminDashboardPendingHospitals from "./AdminDashboardPendingHospitals";
import AdminDashboardRecentActivity from "./AdminDashboardRecentActivity";
import type { AdminActivity } from "@/types/admin";
import type { Hospital } from "@/types/hospital";

const AdminDashboardSecondSection = ({
  pendingHospitals,
  activities,
}: {
  pendingHospitals: Hospital[];
  activities: AdminActivity[];
}) => {
  return (
    <div className="grid grid-cols-12 gap-5 mt-5">
      <AdminDashboardPendingHospitals pendingHospitals={pendingHospitals} />

      <AdminDashboardRecentActivity activities={activities} />
    </div>
  );
};

export default AdminDashboardSecondSection;
