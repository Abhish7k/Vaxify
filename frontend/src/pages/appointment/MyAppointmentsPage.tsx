import { useState } from "react";

import MyAppointmentsHeaderSection from "@/components/appointment/my-appointments/MyAppointmentsHeaderSection";
import MyAppointmentsTabsSection, {
  type AppointmentStatus,
} from "@/components/appointment/my-appointments/MyAppointmentsTabsSection";

export default function MyAppointmentsPage() {
  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>("BOOKED");

  return (
    <div className="space-y-8 max-w-6xl mx-auto mt-10">
      {/* Header */}
      <MyAppointmentsHeaderSection />

      {/* Tabs */}
      <MyAppointmentsTabsSection
        value={activeStatus}
        onChange={setActiveStatus}
      />
    </div>
  );
}
