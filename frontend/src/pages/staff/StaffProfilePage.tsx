import StaffInfoCard from "@/components/dashboards/staff/StaffProfileInfoCard";

export default function StaffProfilePage() {
  return (
    <div className="flex justify-center px-0 sm:px-4 pt-10 sm:pt-4">
      <div className="w-full max-w-3xl space-y-6">
        <StaffInfoCard />
      </div>
    </div>
  );
}
