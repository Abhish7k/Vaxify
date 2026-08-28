package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.dtos.notification.AppointmentMailData;
import com.vaxify.app.dtos.notification.NotificationPayloads;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.exception.ConflictException;
import com.vaxify.app.exception.ForbiddenException;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.repository.*;
import com.vaxify.app.service.AppointmentService;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.service.SlotService;
import com.vaxify.app.service.UserService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.mapper.AppointmentMapper;
import com.vaxify.app.time.BusinessClock;
import com.vaxify.app.util.AfterCommit;
import com.vaxify.app.util.SlotTimes;

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
        private final HospitalService hospitalService;
        private final AppointmentMapper appointmentMapper;
        private final VaccineService vaccineService;
        private final SlotService slotService;

        private final NotificationService notificationService;
        private final BusinessClock businessClock;

        @Override
        @Transactional
        public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail) {
                User user = userService.findByEmail(userEmail);

                if (user.getPhone() == null || user.getPhone().isEmpty()) {
                        throw new VaxifyException("Phone number is required to book an appointment");
                }

                Vaccine vaccine = vaccineService.findEntityByIdForUpdate(request.getVaccineId());

                LocalDate slotDate = LocalDate.parse(request.getDate());

                LocalTime requestedTime = LocalTime.parse(request.getSlot());

                Slot selectedSlot = slotService.findEntityByDetails(request.getCenterId(), slotDate, requestedTime);

                assertVaccineBelongsToSlotHospital(vaccine, selectedSlot, request.getCenterId());

                vaccineService.validateAvailable(vaccine);
                slotService.validateAvailable(selectedSlot, slotDate, requestedTime);

                if (appointmentRepository.existsByUserAndSlotAndStatus(user, selectedSlot, AppointmentStatus.BOOKED)) {
                        throw new ConflictException("You already have a booking for this slot");
                }

                vaccineService.deductStock(vaccine);
                slotService.reserveSlot(selectedSlot);

                Appointment appointment = Appointment.builder()
                                .user(user)
                                .slot(selectedSlot)
                                .vaccine(vaccine)
                                .status(AppointmentStatus.BOOKED)
                                .build();

                Appointment saved = appointmentRepository.save(appointment);

                AppointmentMailData confirmationMail = NotificationPayloads.fromAppointment(saved);
                AfterCommit.run(() -> notificationService.sendAppointmentConfirmation(confirmationMail));

                log.info("Appointment booked: ID={}, User={}, Vaccine={}",
                                saved.getId(), userEmail, vaccine.getName());

                return appointmentMapper.toResponse(saved);
        }

        @Override
        @Transactional(readOnly = true)
        public List<AppointmentResponse> getMyAppointments(String userEmail) {
                User user = userService.findByEmail(userEmail);

                List<AppointmentResponse> responses = appointmentRepository.findByUser(user).stream()
                                .map(appointmentMapper::toResponse)
                                .collect(Collectors.toList());

                return responses;
        }

        @Override
        @Transactional
        public void cancelAppointment(Long appointmentId, String userEmail) {
                User actor = userService.findByEmail(userEmail);

                Appointment appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

                assertCanCancel(actor, appointment, userEmail);

                if (appointment.getStatus() != AppointmentStatus.BOOKED) {
                        throw new ConflictException("Only booked appointments can be cancelled");
                }

                if (SlotTimes.hasStarted(appointment.getSlot(), businessClock.now())) {
                        throw new ConflictException("Appointment can no longer be cancelled after the slot has started");
                }

                appointment.setStatus(AppointmentStatus.CANCELLED);

                vaccineService.refundStock(appointment.getVaccine());
                slotService.releaseSlot(appointment.getSlot());

                appointmentRepository.save(appointment);

                AppointmentMailData cancellationMail = NotificationPayloads.fromAppointment(appointment);
                AfterCommit.run(() -> notificationService.sendAppointmentCancellation(cancellationMail));

                log.info("Appointment cancelled: ID={}, User={}, By={}",
                                appointmentId, appointment.getUser().getEmail(), userEmail);
        }

        @Override
        @Transactional(readOnly = true)
        public AppointmentResponse getAppointmentById(Long id) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

                return appointmentMapper.toResponse(appointment);
        }

        @Override
        @Transactional(readOnly = true)
        public List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId, String actorEmail) {
                User actor = userService.findByEmail(actorEmail);

                assertCanAccessHospitalAppointments(actor, hospitalId);

                List<AppointmentResponse> responses = appointmentRepository.findBySlotCenterId(hospitalId).stream()
                                .map(appointmentMapper::toResponse)
                                .collect(Collectors.toList());

                return responses;
        }

        @Override
        @Transactional
        public void completeAppointment(Long appointmentId, String actorEmail) {
                User actor = userService.findByEmail(actorEmail);

                Appointment appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

                assertCanComplete(actor, appointment);

                if (appointment.getStatus() != AppointmentStatus.BOOKED) {
                        throw new ConflictException("Only booked appointments can be completed");
                }

                if (!SlotTimes.hasStarted(appointment.getSlot(), businessClock.now())) {
                        throw new ConflictException("Appointment cannot be completed before the scheduled slot time");
                }

                appointment.setStatus(AppointmentStatus.COMPLETED);

                Appointment saved = appointmentRepository.save(appointment);

                AppointmentMailData completionMail = NotificationPayloads.fromAppointment(saved);
                AfterCommit.run(() -> notificationService.sendVaccinationCompletion(completionMail));

                log.info("Appointment completed: ID={}", appointmentId);
        }

        private void assertVaccineBelongsToSlotHospital(Vaccine vaccine, Slot slot, Long requestedCenterId) {
                if (vaccine.getHospital() == null || slot.getCenter() == null) {
                        throw new VaxifyException("Vaccine is not available at the selected center");
                }

                Long vaccineHospitalId = vaccine.getHospital().getId();
                Long slotHospitalId = slot.getCenter().getId();

                if (!vaccineHospitalId.equals(slotHospitalId) || !slotHospitalId.equals(requestedCenterId)) {
                        throw new VaxifyException("Vaccine is not available at the selected center");
                }
        }

        private void assertCanAccessHospitalAppointments(User actor, Long hospitalId) {
                if (actor.getRole() == Role.ADMIN) {
                        return;
                }

                if (actor.getRole() != Role.STAFF) {
                        throw new ForbiddenException("You are not authorized to view these appointments");
                }

                Hospital staffHospital = hospitalService.findEntityByStaffEmail(actor.getEmail());

                if (!staffHospital.getId().equals(hospitalId)) {
                        throw new ForbiddenException("You are not authorized to view these appointments");
                }
        }

        private void assertCanCancel(User actor, Appointment appointment, String userEmail) {
                boolean isOwner = appointment.getUser().getEmail().equals(userEmail);

                if (isOwner) {
                        return;
                }

                if (actor.getRole() == Role.ADMIN) {
                        return;
                }

                if (actor.getRole() == Role.STAFF) {
                        assertStaffOwnsAppointmentHospital(actor, appointment);
                        return;
                }

                throw new ForbiddenException("You are not authorized to cancel this appointment");
        }

        private void assertCanComplete(User actor, Appointment appointment) {
                if (actor.getRole() == Role.ADMIN) {
                        return;
                }

                if (actor.getRole() == Role.STAFF) {
                        assertStaffOwnsAppointmentHospital(actor, appointment);
                        return;
                }

                throw new ForbiddenException("You are not authorized to complete this appointment");
        }

        private void assertStaffOwnsAppointmentHospital(User actor, Appointment appointment) {
                Hospital staffHospital = hospitalService.requireApprovedStaffHospital(actor.getEmail());

                Long appointmentHospitalId = appointment.getSlot() != null && appointment.getSlot().getCenter() != null
                                ? appointment.getSlot().getCenter().getId()
                                : null;

                if (appointmentHospitalId == null || !staffHospital.getId().equals(appointmentHospitalId)) {
                        throw new ForbiddenException("You are not authorized to manage this appointment");
                }
        }
}
