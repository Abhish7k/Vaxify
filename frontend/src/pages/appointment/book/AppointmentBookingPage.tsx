import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import BookingHeaderSection from "@/components/appointment/book/BookingHeaderSection";
import CenterNotFound from "@/components/centers/center-details/CenterNotFound";
import { LoaderCircle, XCircle } from "lucide-react";
import { hospitalApi } from "@/api/hospital.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import BookingDateAndSlotSection from "@/components/appointment/book/BookingSlotSection";
import VaccineSelectionSection from "@/components/appointment/book/VaccineSelectionSection";
import ConfirmBookingFooter from "@/components/appointment/book/ConfirmBookingFooter";
import { vaccineApi } from "@/api/vaccine.api";
import { appointmentApi } from "@/api/appointment.api";
import type { Vaccine } from "@/types/vaccine";
import type { TimeSlot, HospitalTimeSlot } from "@/types/appointment";
import type { Center } from "@/types/hospital";

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
  const [center, setCenter] = useState<Center | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [allHospitalSlots, setAllHospitalSlots] = useState<HospitalTimeSlot[]>(
    [],
  );

  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // fetch center details
  useEffect(() => {
    if (!centerId) return;

    const fetchCenter = async () => {
      try {
        setIsLoading(true);
        const data = await hospitalApi.getHospitalById(centerId);
        if (data) {
          setCenter(data);
        }
      } catch (error) {
        console.error("failed to fetch center", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCenter();
  }, [centerId]);

  // fetch vaccines on mount or when centerId changes
  useEffect(() => {
    if (!centerId) return;

    const fetchVaccines = async () => {
      try {
        setIsLoadingVaccines(true);
        const centerVaccines =
          await vaccineApi.getVaccinesByHospitalId(centerId);
        setVaccines(centerVaccines);
      } catch (error) {
        console.error("failed to fetch vaccines", error);
      } finally {
        setIsLoadingVaccines(false);
      }
    };

    fetchVaccines();
  }, [centerId]);

  // fetch all slots for the center
  useEffect(() => {
    if (!centerId) return;

    const fetchAllSlots = async () => {
      try {
        setIsLoadingSlots(true);

        const slots = await appointmentApi.getHospitalSlots(centerId);

        setAllHospitalSlots(slots);
      } catch (error) {
        console.error("failed to fetch all slots", error);

        setAllHospitalSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAllSlots();
  }, [centerId]);

  // update available slots when date or allHospitalSlots changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const filteredSlots = allHospitalSlots.filter(
      (slot) => slot.date === selectedDate,
    );

    setAvailableSlots(filteredSlots);
  }, [selectedDate, allHospitalSlots]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary/80" />
      </div>
    );
  }

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

      <div className="flex flex-col md:flex-row justify-between gap-10 px-5 mt-16 mb-20">
        {!isLoadingVaccines && vaccines.length === 0
          ? (
            <div className="w-full flex justify-center">
              <Card className="max-w-md w-full flex flex-col items-center text-center text-muted-foreground shadow-none border-none">
                <XCircle className="w-12 h-12 opacity-20" />

                <h3 className="text-lg font-medium text-foreground">
                  Out of Stock
                </h3>

                <p className="mt-2 text-sm">
                  There are no vaccines currently available <br />
                  for booking at this center.
                </p>

                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </Card>
            </div>
          ) : (
            <>
              <motion.div className="w-full" variants={itemVariants}>
                <VaccineSelectionSection
                  vaccines={vaccines.map((v) => ({
                    id: v.id,
                    name: v.name,
                    description: v.type,
                  }))}
                  selectedVaccineId={selectedVaccineId}
                  isLoading={isLoadingVaccines}
                  onSelect={(id) => {
                    setSelectedVaccineId(id);

                    setSelectedSlot(null);
                  }}
                />
              </motion.div>

              <motion.div className="w-full" variants={itemVariants}>
                <BookingDateAndSlotSection
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  availableSlots={availableSlots}
                  allSlots={allHospitalSlots}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  onSlotSelect={setSelectedSlot}
                  onResetSlot={() => setSelectedSlot(null)}
                  isLoadingSlots={isLoadingSlots}
                />
              </motion.div>
            </>
          )}
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
