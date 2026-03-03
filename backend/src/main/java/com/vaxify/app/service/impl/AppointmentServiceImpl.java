package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.repository.*;
import com.vaxify.app.service.AppointmentService;
import com.vaxify.app.service.AppointmentCleanupService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.service.SlotService;
import com.vaxify.app.service.UserService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.mapper.AppointmentMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

        private final AppointmentRepository appointmentRepository;

        private final UserService userService;
        private final AppointmentMapper appointmentMapper;
        private final VaccineService vaccineService;
        private final SlotService slotService;

        private final NotificationService notificationService;
        private final AppointmentCleanupService appointmentCleanupService;

        @Override
        @Transactional
        public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail) {
                User user = userService.findByEmail(userEmail);

                if (user.getPhone() == null || user.getPhone().isEmpty()) {
                        throw new VaxifyException("Phone number is required to book an appointment");
                }

                Vaccine vaccine = vaccineService.findEntityById(request.getVaccineId());

                LocalDate slotDate = LocalDate.parse(request.getDate());

                LocalTime requestedTime = LocalTime.parse(request.getSlot());

                Slot selectedSlot = slotService.findEntityByDetails(request.getCenterId(), slotDate, requestedTime);

                vaccineService.validateAvailable(vaccine);
                slotService.validateAvailable(selectedSlot, slotDate, requestedTime);

                // mutate state via services
                vaccineService.deductStock(vaccine);
                slotService.reserveSlot(selectedSlot);

                // persist
                Appointment appointment = Appointment.builder()
                                .user(user)
                                .slot(selectedSlot)
                                .vaccine(vaccine)
                                .status(AppointmentStatus.BOOKED)
                                .build();

                Appointment saved = appointmentRepository.save(appointment);

                notificationService.sendAppointmentConfirmation(saved);

                log.info("Appointment booked: ID={}, User={}, Vaccine={}",
                                saved.getId(), userEmail, vaccine.getName());

                return appointmentMapper.toResponse(saved);
        }

        @Override
        @Transactional
        public List<AppointmentResponse> getMyAppointments(String userEmail) {
                User user = userService.findByEmail(userEmail);

                appointmentCleanupService.cleanupOverdueForUser(user);

                List<AppointmentResponse> responses = appointmentRepository.findByUser(user).stream()
                                .map(appointmentMapper::toResponse)
                                .collect(Collectors.toList());

                return responses;
        }

        @Override
        @Transactional
        public void cancelAppointment(Long appointmentId, String userEmail) {
                User actor = userService.findByEmail(userEmail);

                Appointment appointment = appointmentRepository.findById(appointmentId)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));

                boolean isOwner = appointment.getUser().getEmail().equals(userEmail);

                boolean isPrivileged = actor.getRole() == Role.STAFF || actor.getRole() == Role.ADMIN;

                if (!isOwner && !isPrivileged) {
                        throw new VaxifyException("You are not authorized to cancel this appointment");
                }

                appointment.setStatus(AppointmentStatus.CANCELLED);

                // refund via services
                vaccineService.refundStock(appointment.getVaccine());
                slotService.releaseSlot(appointment.getSlot());

                appointmentRepository.save(appointment);

                notificationService.sendAppointmentCancellation(appointment);

                log.info("Appointment cancelled: ID={}, User={}, By={}",
                                appointmentId, appointment.getUser().getEmail(), userEmail);
        }

        @Override
        public AppointmentResponse getAppointmentById(Long id) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new VaxifyException("Appointment not found"));

                return appointmentMapper.toResponse(appointment);
        }

        @Override
        @Transactional
        public List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId) {
                appointmentCleanupService.cleanupOverdueForHospital(hospitalId);

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

                notificationService.sendVaccinationCompletion(saved);

                log.info("Appointment completed: ID={}", appointmentId);
        }

        @Override
        public boolean hasActiveBookings(Slot slot) {
                return appointmentRepository.existsBySlotAndStatus(slot, AppointmentStatus.BOOKED);
        }

        @Override
        public void deleteAppointmentsBySlot(Slot slot) {
                appointmentRepository.deleteAllBySlot(slot);
        }
}
