import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import BookingHeaderSection from "@/components/appointment/book/BookingHeaderSection";
import CenterNotFound from "@/components/centers/center-details/CenterNotFound";

import { centersData } from "@/constants/centers-mock-data";
import { useEffect, useState } from "react";
import BookingDateAndSlotSection from "@/components/appointment/book/BookingSlotSection";
import VaccineSelectionSection from "@/components/appointment/book/VaccineSelectionSection";
import ConfirmBookingFooter from "@/components/appointment/book/ConfirmBookingFooter";
import { vaccineApi } from "@/api/vaccine.api";
import { appointmentApi } from "@/api/appointment.api";
import type { Vaccine } from "@/types/vaccine";
import type { TimeSlot } from "@/types/appointment";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// opacity only for fixed elements to avoid stacking context issues
const fixedItemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const AppointmentBookingPage = () => {
  const { centerId } = useParams();
  const navigate = useNavigate();

  // state
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const center = centersData.find((c) => c.id === centerId);

  // fetch vaccines on mount
  useEffect(() => {
    if (!center) return;

    const fetchVaccines = async () => {
      try {
        const allVaccines = await vaccineApi.getVaccines();

        // filter vaccines available at this center
        const centerVaccines = allVaccines.filter((v) =>
          center.availableVaccines.includes(v.name),
        );
        setVaccines(centerVaccines);
      } catch (error) {
        console.error("failed to fetch vaccines", error);
      }
    };

    fetchVaccines();
  }, [center]);

  // fetch slots when date changes
  useEffect(() => {
    if (!centerId || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setIsLoadingSlots(true);

        const slots = await appointmentApi.getSlots(centerId, selectedDate);

        setAvailableSlots(slots);
      } catch (error) {
        console.error("failed to fetch slots", error);

        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [centerId, selectedDate]);

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
    <motion.div
      className="py-10 max-w-7xl mx-auto px-5 flex flex-col gap-10 min-h-[90vh]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <BookingHeaderSection center={center} />
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between gap-10 px-5 mt-16 mb-32">
        <motion.div className="w-full" variants={itemVariants}>
          <VaccineSelectionSection
            vaccines={vaccines.map((v) => ({
              id: v.id,
              name: v.name,
              description: v.type, // mapping type to description for ui
            }))}
            selectedVaccineId={selectedVaccineId}
            onSelect={(id) => {
              setSelectedVaccineId(id);

              // do not reset date, but maybe reset slot
              // keeping date is better ux

              setSelectedSlot(null);
            }}
          />
        </motion.div>

        <motion.div className="w-full" variants={itemVariants}>
          <BookingDateAndSlotSection
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            availableSlots={availableSlots}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
            onSlotSelect={setSelectedSlot}
            onResetSlot={() => setSelectedSlot(null)}
            isLoadingSlots={isLoadingSlots}
          />
        </motion.div>
      </div>

      <motion.div variants={fixedItemVariants}>
        <ConfirmBookingFooter
          isDisabled={!isBookingReady}
          vaccineName={selectedVaccine?.name}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onConfirm={handleConfirmBooking}
        />
      </motion.div>
    </motion.div>
  );
};

export default AppointmentBookingPage;
