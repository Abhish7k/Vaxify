package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.SlotStatus;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.repository.*;
import com.vaxify.app.service.AppointmentService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.mapper.AppointmentMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

        private final AppointmentRepository appointmentRepository;
        private final VaccineRepository vaccineRepository;
        private final SlotRepository slotRepository;

        private final UserRepository userRepository;
        private final AppointmentMapper appointmentMapper;
        private final VaccineService vaccineService;

        private final NotificationService notificationService;

        @Override
        @Transactional
        public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new VaxifyException("User not found"));

                Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

                LocalDate slotDate = LocalDate.parse(request.getDate());

                List<Slot> slots = slotRepository.findByCenterIdAndDate(request.getCenterId(), slotDate);

                // compare localtime objects to handle format differences (e.g. 09:00 vs
                // 09:00:00)
                LocalTime requestedTime = LocalTime.parse(request.getSlot());

                // Time Travel Check
                LocalDateTime slotDateTime = LocalDateTime.of(slotDate, requestedTime);

                if (slotDateTime.isBefore(LocalDateTime.now())) {
                        throw new VaxifyException("Cannot book a slot for a time that has already passed.");
                }

                Slot selectedSlot = slots.stream().filter(s -> s.getStartTime().equals(requestedTime)).findFirst()
                                .orElseThrow(() -> new VaxifyException(
                                                "No available slot found for the selected time"));

                if (selectedSlot.getStatus() == SlotStatus.FULL
                                || selectedSlot.getBookedCount() >= selectedSlot.getCapacity()) {
                        throw new VaxifyException("Selected slot is already full");
                }

                // check and deduct vaccine stock
                if (vaccine.getStock() <= 0) {
                        throw new VaxifyException("Vaccine is out of stock");
                }

                // Block booking if stock is critically low (< 20% of capacity)
                if (vaccine.getCapacity() != null && vaccine.getCapacity() > 0
                                && vaccine.getStock() < (vaccine.getCapacity() * 0.2)) {
                        throw new VaxifyException("Booking suspended: Vaccine stock is critically low (< 20%)");
                }

                vaccine.setStock(vaccine.getStock() - 1);

                vaccineRepository.save(vaccine);

                vaccineService.checkStockAlerts(vaccine);

                Appointment appointment = Appointment.builder().user(user).slot(selectedSlot).vaccine(vaccine)
                                .status(AppointmentStatus.BOOKED).build();

                selectedSlot.setBookedCount(selectedSlot.getBookedCount() + 1);

                if (selectedSlot.getBookedCount() >= selectedSlot.getCapacity()) {
                        selectedSlot.setStatus(SlotStatus.FULL);
                }

                slotRepository.save(selectedSlot);

                Appointment saved = appointmentRepository.save(appointment);

                notificationService.sendAppointmentConfirmation(saved);

                return appointmentMapper.toResponse(saved);
        }

        @Override
        public List<AppointmentResponse> getMyAppointments(String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new VaxifyException("User not found"));

                List<AppointmentResponse> responses = appointmentRepository.findAll().stream()
                                .filter(a -> a.getUser().getId().equals(user.getId()))
                                .map(appointmentMapper::toResponse)
                                .collect(Collectors.toList());

                return responses;
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

                // refund vaccine stock
                Vaccine vaccine = appointment.getVaccine();

                vaccine.setStock(vaccine.getStock() + 1);

                vaccineRepository.save(vaccine);

                Slot slot = appointment.getSlot();

                slot.setBookedCount(slot.getBookedCount() - 1);

                if (slot.getStatus() == SlotStatus.FULL && slot.getBookedCount() < slot.getCapacity()) {
                        slot.setStatus(SlotStatus.AVAILABLE);
                }

                slotRepository.save(slot);

                appointmentRepository.save(appointment);

                notificationService.sendAppointmentCancellation(appointment);
        }

        @Override
        public AppointmentResponse getAppointmentById(Long id) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));

                return appointmentMapper.toResponse(appointment);
        }

        @Override
        @Transactional(readOnly = true)
        public List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId) {
                List<AppointmentResponse> responses = appointmentRepository.findBySlotCenterId(hospitalId).stream()
                                .map(appointmentMapper::toResponse)
                                .collect(Collectors.toList());

                return responses;
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

                appointment.setStatus(AppointmentStatus.COMPLETED);

                Appointment saved = appointmentRepository.save(appointment);

                notificationService.sendVaccinationCompletion(saved);
        }

}
