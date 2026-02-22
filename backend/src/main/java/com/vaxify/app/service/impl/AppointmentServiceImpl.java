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
import com.vaxify.app.service.UserService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.mapper.AppointmentMapper;
import com.vaxify.app.util.VaccineUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

        private final AppointmentRepository appointmentRepository;
        private final VaccineRepository vaccineRepository;
        private final SlotRepository slotRepository;

        private final UserService userService;
        private final AppointmentMapper appointmentMapper;
        private final VaccineService vaccineService;

        private final NotificationService notificationService;

        @Override
        @Transactional
        public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail) {
                User user = userService.findByEmail(userEmail);

                if (user.getPhone() == null || user.getPhone().isEmpty()) {
                        throw new VaxifyException("Phone number is required to book an appointment");
                }

                Vaccine vaccine = vaccineRepository.findById(request.getVaccineId())
                                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

                LocalDate slotDate = LocalDate.parse(request.getDate());

                LocalTime requestedTime = LocalTime.parse(request.getSlot());

                Slot selectedSlot = getAvailableSlot(request.getCenterId(), slotDate, requestedTime);

                validateBooking(vaccine, selectedSlot, slotDate, requestedTime);

                // mutate state
                decrementVaccineStock(vaccine);

                incrementSlotBookings(selectedSlot);

                // persist
                Appointment appointment = Appointment.builder()
                                .user(user)
                                .slot(selectedSlot)
                                .vaccine(vaccine)
                                .status(AppointmentStatus.BOOKED)
                                .build();

                Appointment saved = appointmentRepository.save(appointment);

                log.info("Appointment booked successfully: ID={}, User={}, Vaccine={}",
                                saved.getId(), userEmail, vaccine.getName());

                notificationService.sendAppointmentConfirmation(saved);

                return appointmentMapper.toResponse(saved);
        }

        private Slot getAvailableSlot(Long centerId, LocalDate date, LocalTime time) {
                List<Slot> slots = slotRepository.findByCenterIdAndDate(centerId, date);

                return slots.stream()
                                .filter(s -> s.getStartTime().equals(time))
                                .findFirst()
                                .orElseThrow(() -> new VaxifyException(
                                                "No available slot found for the selected time"));
        }

        private void validateBooking(Vaccine vaccine, Slot slot, LocalDate date, LocalTime time) {
                // time travel check
                if (LocalDateTime.of(date, time).isBefore(LocalDateTime.now())) {
                        throw new VaxifyException("Cannot book a slot for a time that has already passed");
                }

                // slot capacity check
                if (slot.getStatus() == SlotStatus.FULL || slot.getBookedCount() >= slot.getCapacity()) {
                        throw new VaxifyException("Selected slot is already full");
                }

                // stock check
                if (vaccine.getStock() <= 0) {
                        throw new VaxifyException("Vaccine is out of stock");
                }

                if (VaccineUtils.isStockCritical(vaccine)) {
                        throw new VaxifyException("Booking suspended: Vaccine stock is critically low (< 20%)");
                }
        }

        private void decrementVaccineStock(Vaccine vaccine) {
                vaccine.setStock(vaccine.getStock() - 1);

                vaccineRepository.save(vaccine);

                vaccineService.checkStockAlerts(vaccine);
        }

        private void incrementSlotBookings(Slot slot) {
                slot.setBookedCount(slot.getBookedCount() + 1);

                if (slot.getBookedCount() >= slot.getCapacity()) {
                        slot.setStatus(SlotStatus.FULL);
                }

                slotRepository.save(slot);
        }

        @Override
        public List<AppointmentResponse> getMyAppointments(String userEmail) {
                User user = userService.findByEmail(userEmail);

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

                // refund vax stock
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

                log.info("Appointment cancelled by user: ID={}, User={}", appointmentId, userEmail);

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

                // check not cancelled/done
                if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                        throw new VaxifyException("Cannot complete a cancelled appointment");
                }

                if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new VaxifyException("Appointment is already completed");
                }

                appointment.setStatus(AppointmentStatus.COMPLETED);

                Appointment saved = appointmentRepository.save(appointment);

                log.info("Appointment marked as COMPLETED: ID={}", appointmentId);

                notificationService.sendVaccinationCompletion(saved);
        }
}
