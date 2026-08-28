import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import BookingHeaderSection from "@/components/appointment/book/BookingHeaderSection";
import CenterNotFound from "@/components/centers/center-details/CenterNotFound";
import { LoaderCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import BookingDateAndSlotSection from "@/components/appointment/book/BookingSlotSection";
import VaccineSelectionSection from "@/components/appointment/book/VaccineSelectionSection";
import ConfirmBookingFooter from "@/components/appointment/book/ConfirmBookingFooter";
import type { TimeSlot } from "@/types/appointment";
import { isNotFoundError } from "@/lib/errors";
import { PageLoadError } from "@/components/ui/page-load-error";
import { useHospital } from "@/hooks/queries/use-hospitals";
import { useHospitalVaccines } from "@/hooks/queries/use-vaccines";
import { useBookingSlots } from "@/hooks/queries/use-appointments";
import { loadBookingDraft, saveBookingDraft } from "@/lib/booking-draft";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { fadeUpItem, fadeItem, staggerContainer } from "@/lib/motion";

const AppointmentBookingPage = () => {
  const { centerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const hospitalQuery = useHospital(centerId);
  const vaccinesQuery = useHospitalVaccines(centerId);
  const slotsQuery = useBookingSlots(centerId);

  const center = hospitalQuery.data ?? null;
  const vaccines = vaccinesQuery.data ?? [];
  const allHospitalSlots = slotsQuery.data ?? [];
  const isLoading = hospitalQuery.isPending;
  const isLoadingVaccines = vaccinesQuery.isPending;
  const isLoadingSlots = slotsQuery.isFetching;
  const notFound =
    (!hospitalQuery.isPending && !center && !hospitalQuery.isError) ||
    isNotFoundError(hospitalQuery.error);
  const loadError = hospitalQuery.isError && !notFound;
  const bookingDataError = vaccinesQuery.isError || slotsQuery.isError;

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);

  useUnsavedChanges(Boolean(selectedVaccineId || selectedSlot), {
    allowPath: (pathname) => pathname.startsWith("/appointments/book/"),
  });

  useEffect(() => {
    if (!centerId) return;

    const draft = loadBookingDraft(centerId);
    if (draft) {
      setSelectedVaccineId(draft.selectedVaccineId);
      setSelectedDate(draft.selectedDate);
      setSelectedSlot(draft.selectedSlot);
    }

    setDraftHydrated(true);
  }, [centerId]);

  useEffect(() => {
    const state = location.state as { slotTaken?: boolean } | null;
    if (!state?.slotTaken) return;

    setSelectedSlot(null);
    void slotsQuery.refetch();
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, slotsQuery]);

  useEffect(() => {
    if (!draftHydrated || !center) return;

    const selectedVaccine = vaccines.find((v) => v.id === selectedVaccineId) ?? null;

    saveBookingDraft({
      centerId: center.id,
      center: {
        id: center.id,
        name: center.name,
        address: center.address,
      },
      selectedVaccineId,
      selectedDate,
      selectedSlot,
      vaccine: selectedVaccine
        ? { id: selectedVaccine.id, name: selectedVaccine.name }
        : null,
    });
  }, [center, draftHydrated, selectedDate, selectedSlot, selectedVaccineId, vaccines]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const filteredSlots = allHospitalSlots.filter((slot) => slot.date === selectedDate);
    setAvailableSlots(filteredSlots);
  }, [selectedDate, allHospitalSlots]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  if (isLoading || !draftHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary/80" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <PageLoadError
          message="Could not load this center. Please try again."
          onRetry={() => void hospitalQuery.refetch()}
        />
      </div>
    );
  }

  if (notFound || !center) {
    return <CenterNotFound />;
  }

  const selectedVaccine = vaccines.find((v) => v.id === selectedVaccineId);

  const isBookingReady = selectedVaccineId && selectedDate && selectedSlot;

  const handleConfirmBooking = () => {
    if (!isBookingReady || !selectedVaccine || !selectedDate || !selectedSlot) return;

    saveBookingDraft({
      centerId: center.id,
      center: {
        id: center.id,
        name: center.name,
        address: center.address,
      },
      selectedVaccineId,
      selectedDate,
      selectedSlot,
      vaccine: { id: selectedVaccine.id, name: selectedVaccine.name },
    });

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
      className="py-10 max-w-7xl mx-auto px-5 flex flex-col gap-10 min-h-[90vh] mb-10"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpItem}>
        <BookingHeaderSection center={center} />
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between gap-10 px-5 mt-16 mb-20">
        {bookingDataError ? (
          <div className="w-full">
            <PageLoadError
              message="Could not load vaccines or available slots. Please try again."
              onRetry={() => {
                void vaccinesQuery.refetch();
                void slotsQuery.refetch();
              }}
            />
          </div>
        ) : !isLoadingVaccines && vaccines.length === 0 ? (
          <div className="w-full flex justify-center">
            <Card className="max-w-md w-full flex flex-col items-center text-center text-muted-foreground shadow-none border-none">
              <XCircle className="w-12 h-12 opacity-20" />

              <h3 className="text-lg font-medium text-foreground">Out of Stock</h3>

              <p className="mt-2 text-sm">
                There are no vaccines currently available <br />
                for booking at this center.
              </p>

              <Button variant="outline" className="mt-2" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </Card>
          </div>
        ) : (
          <>
            <motion.div className="w-full" variants={fadeUpItem}>
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

            <motion.div className="w-full" variants={fadeUpItem}>
              <BookingDateAndSlotSection
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                availableSlots={availableSlots}
                allSlots={allHospitalSlots}
                onDateSelect={handleDateSelect}
                onSlotSelect={setSelectedSlot}
                onResetSlot={() => setSelectedSlot(null)}
                isLoadingSlots={isLoadingSlots}
              />
            </motion.div>
          </>
        )}
      </div>

      <motion.div variants={fadeItem}>
        <ConfirmBookingFooter
          isDisabled={!isBookingReady || bookingDataError}
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
