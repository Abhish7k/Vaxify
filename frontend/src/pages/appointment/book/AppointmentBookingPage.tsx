import { useNavigate, useParams } from "react-router-dom";
import BookingHeaderSection from "@/components/appointment/book/BookingHeaderSection";
import CenterNotFound from "@/components/centers/center-details/CenterNotFound";

import { centersData } from "@/constants/centers-mock-data";
import { useState } from "react";
import BookingDateAndSlotSection from "@/components/appointment/book/BookingSlotSection";
import VaccineSelectionSection from "@/components/appointment/book/VaccineSelectionSection";
import ConfirmBookingFooter from "@/components/appointment/book/ConfirmBookingFooter";

const AppointmentBookingPage = () => {
  const { centerId } = useParams();

  const navigate = useNavigate();

  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(
    null,
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const center = centersData.find((c) => c.id === centerId);

  if (!center) {
    return <CenterNotFound />;
  }

  const selectedVaccine = vaccines.find((v) => v.id === selectedVaccineId);

  const isBookingReady = selectedVaccineId && selectedDate && selectedSlot;

  const handleConfirmBooking = () => {
    if (!isBookingReady) return;

    navigate("/appointments/book/summary", {
      state: {
        center,
        vaccine: selectedVaccine,
        date: selectedDate,
        slot: selectedSlot,
      },
    });
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-10 flex flex-col gap-10 min-h-[90vh]">
      <BookingHeaderSection center={center} />

      <div className="flex flex-col md:flex-row justify-between gap-10 px-5 mt-16 mb-32">
        <VaccineSelectionSection
          vaccines={vaccines}
          selectedVaccineId={selectedVaccineId}
          onSelect={(id) => {
            setSelectedVaccineId(id);
            setSelectedDate(null);
            setSelectedSlot(null);
          }}
        />

        <BookingDateAndSlotSection
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setSelectedSlot(null);
          }}
          onSlotSelect={setSelectedSlot}
          onResetSlot={() => setSelectedSlot(null)}
        />
      </div>

      <ConfirmBookingFooter
        isDisabled={!isBookingReady}
        vaccineName={selectedVaccine?.name}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default AppointmentBookingPage;

const vaccines = [
  {
    id: "covishield",
    name: "Covishield",
    description: "AstraZeneca-based COVID-19 vaccine",
  },
  {
    id: "covaxin",
    name: "Covaxin",
    description: "Inactivated virus COVID-19 vaccine",
  },
];
