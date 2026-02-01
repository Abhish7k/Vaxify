package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.SlotStatus;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.repository.*;
import com.vaxify.app.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

        private final AppointmentRepository appointmentRepository;
        private final VaccineRepository vaccineRepository;
        private final SlotRepository slotRepository;
        private final UserRepository userRepository;

        @Override
        @Transactional
        public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new VaxifyException("User not found"));

                Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

                List<Slot> slots = slotRepository.findByCenterIdAndDate(request.getCenterId(),
                                java.time.LocalDate.parse(request.getDate()));

                // compare localtime objects to handle format differences (e.g. 09:00 vs
                // 09:00:00)
                java.time.LocalTime requestedTime = java.time.LocalTime.parse(request.getSlot());

                Slot selectedSlot = slots.stream().filter(s -> s.getStartTime().equals(requestedTime)).findFirst()
                                .orElseThrow(() -> new VaxifyException(
                                                "No available slot found for the selected time"));

                if (selectedSlot.getStatus() == SlotStatus.FULL
                                || selectedSlot.getBookedCount() >= selectedSlot.getCapacity()) {
                        throw new VaxifyException("Selected slot is already full");
                }

                Appointment appointment = Appointment.builder().user(user).slot(selectedSlot).vaccine(vaccine)
                                .status(AppointmentStatus.BOOKED).build();

                selectedSlot.setBookedCount(selectedSlot.getBookedCount() + 1);
                if (selectedSlot.getBookedCount() >= selectedSlot.getCapacity()) {
                        selectedSlot.setStatus(SlotStatus.FULL);
                }
                slotRepository.save(selectedSlot);

                Appointment saved = appointmentRepository.save(appointment);
                return mapToResponse(saved);
        }

        @Override
        public List<AppointmentResponse> getMyAppointments(String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new VaxifyException("User not found"));

                return appointmentRepository.findAll().stream().filter(a -> a.getUser().getId().equals(user.getId()))
                                .map(this::mapToResponse).collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void cancelAppointment(Long appointmentId, String userEmail) {
                Appointment appointment = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));

                if (!appointment.getUser().getEmail().equals(userEmail)) {
                        throw new VaxifyException("You are not authorized to cancel this appointment");
                }

                appointment.setStatus(AppointmentStatus.CANCELLED);

                Slot slot = appointment.getSlot();
                slot.setBookedCount(slot.getBookedCount() - 1);
                if (slot.getStatus() == SlotStatus.FULL && slot.getBookedCount() < slot.getCapacity()) {
                        slot.setStatus(SlotStatus.AVAILABLE);
                }
                slotRepository.save(slot);

                appointmentRepository.save(appointment);
        }

        @Override
        public AppointmentResponse getAppointmentById(Long id) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));
                return mapToResponse(appointment);
        }

        @Override
        @Transactional(readOnly = true)
        public List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId) {
                return appointmentRepository.findBySlotCenterId(hospitalId).stream().map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void completeAppointment(Long appointmentId) {
                Appointment appointment = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));

                // ensure its not cancelled or already completed
                if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                        throw new VaxifyException("Cannot complete a cancelled appointment");
                }
                if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new VaxifyException("Appointment is already completed");
                }

                // automated vaccine stock deduction
                Vaccine vaccine = appointment.getVaccine();

                if (vaccine.getStock() <= 0) {
                        throw new VaxifyException("Insufficient vaccine stock to complete this appointment");
                }

                // Decrement stock
                vaccine.setStock(vaccine.getStock() - 1);
                vaccineRepository.save(vaccine);

                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepository.save(appointment);
        }

        private AppointmentResponse mapToResponse(Appointment a) {
                return AppointmentResponse.builder().id(a.getId()).centerId(a.getSlot().getCenter().getId())
                                .centerName(a.getSlot().getCenter().getName())
                                .centerAddress(a.getSlot().getCenter().getAddress()).vaccineId(a.getVaccine().getId())
                                .vaccineName(a.getVaccine().getName()).date(a.getSlot().getDate().toString())
                                .slot(a.getSlot().getStartTime().toString()).status(a.getStatus())
                                .createdAt(a.getCreatedAt()).patientName(a.getUser().getName())
                                .patientEmail(a.getUser().getEmail()).patientPhone(a.getUser().getPhone()).build();
        }
}
