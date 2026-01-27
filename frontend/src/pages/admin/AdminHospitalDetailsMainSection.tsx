import {
  Hospital,
  MapPin,
  Clock,
  Syringe,
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  ArrowLeft,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AppointmentStatusBadge from "@/components/appointment/my-appointments/AppointmentStatusBadge";

export default function MainSection() {
  const hospital = {
    id: "hosp-1",
    name: "City Health Hospital",
    address: "MG Road, Pune",
    status: "PENDING" as const,
    registeredOn: "2026-01-10",
    workingHours: "9:00 AM – 5:00 PM",
    vaccines: [
      { name: "Covishield", stock: 120 },
      { name: "Covaxin", stock: 60 },
      { name: "Sputnik V", stock: 0 },
    ],
    staff: {
      name: "Ramesh Kumar",
      email: "ramesh@cityhealth.com",
      phone: "9876543210",
    },
  };

  return (
    <div className="space-y-8">
      {/* go back btn */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-all duration-300" />
          Go back
        </button>
      </div>
      {/* header */}
      <div className="flex items-start gap-10">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Hospital className="h-6 w-6 text-muted-foreground" />
            {hospital.name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {hospital.address}
          </p>
        </div>

        <div>
          <AppointmentStatusBadge status={hospital.status} />
        </div>
      </div>

      {/* basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hospital Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Working Hours: {hospital.workingHours}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Registered On: {hospital.registeredOn}
          </div>

          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Hospital ID: {hospital.id}
          </div>
        </CardContent>
      </Card>

      {/* vaccine info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vaccines & Stock</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {hospital.vaccines.map((vaccine) => (
            <div
              key={vaccine.name}
              className="flex items-center justify-between border-b last:border-b-0 py-2"
            >
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-muted-foreground" />
                {vaccine.name}
              </div>

              <span className="text-muted-foreground">
                Stock: {vaccine.stock}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* staff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Staff</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback>
                {hospital.staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4 text-sm">
              <p className="font-medium flex items-center gap-1">
                <User className="h-4 w-4 text-muted-foreground" />
                {hospital.staff.name}
              </p>

              <p className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {hospital.staff.email}
              </p>

              <p className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {hospital.staff.phone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
