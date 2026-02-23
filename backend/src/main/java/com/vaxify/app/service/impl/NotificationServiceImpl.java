package com.vaxify.app.service.impl;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.service.EmailService;
import com.vaxify.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

        private final EmailService emailService;

        private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

        private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

        @Override
        public void sendHospitalRegistrationReceived(Hospital hospital) {
                if (hospital.getStaffUser() == null) {
                        return;
                }

                String subject = "Hospital Registration Received - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "You have successfully registered your hospital '%s' on Vaxify.\n" +
                                                "Your application is currently PENDING approval from the admin.\n" +
                                                "You will be notified once the status changes.",
                                hospital.getStaffUser().getName(),
                                hospital.getName());

                sendWithSignature(hospital.getStaffUser().getEmail(), subject, content);

                log.info("Sent registration received notification to: {}", hospital.getStaffUser().getEmail());
        }

        @Override
        public void sendHospitalApproved(Hospital hospital) {
                if (hospital.getStaffUser() == null) {
                        return;
                }

                String subject = "Hospital Registration Approved - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Your hospital registration for '%s' has been APPROVED by the admin.\n"
                                                +
                                                "You can now login and manage your hospital dashboard.",
                                hospital.getStaffUser().getName(),
                                hospital.getName());

                sendWithSignature(hospital.getStaffUser().getEmail(), subject, content);

                log.info("Sent hospital approved notification to: {}", hospital.getStaffUser().getEmail());
        }

        @Override
        public void sendHospitalRejected(Hospital hospital) {
                if (hospital.getStaffUser() == null) {
                        return;
                }

                String subject = "Hospital Registration Rejected - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Your hospital registration for '%s' has been REJECTED by the admin.\n"
                                                +
                                                "Please contact support for more details.",
                                hospital.getStaffUser().getName(),
                                hospital.getName());

                sendWithSignature(hospital.getStaffUser().getEmail(), subject, content);

                log.info("Sent hospital rejected notification to: {}", hospital.getStaffUser().getEmail());
        }

        @Override
        public void sendVaccineStockCritical(Vaccine vaccine, int stock, int capacity) {
                if (vaccine.getHospital() == null || vaccine.getHospital().getStaffUser() == null) {
                        return;
                }

                String subject = "CRITICAL: Vaccine Stock Critical (<20%) - Booking Blocked Warning";

                String body = String.format(
                                "The stock for vaccine '%s' is CRITICAL (%d/%d).\n" +
                                                "Bookings may be blocked soon if stock runs out. Please restock immediately.",
                                vaccine.getName(),
                                stock,
                                capacity);

                emailService.sendSimpleEmail(vaccine.getHospital().getStaffUser().getEmail(), subject, body);

                log.info("Sent vaccine stock critical alert for hospital: {}", vaccine.getHospital().getId());
        }

        @Override
        public void sendVaccineStockLow(Vaccine vaccine, int stock, int capacity) {
                if (vaccine.getHospital() == null || vaccine.getHospital().getStaffUser() == null) {
                        return;
                }

                String subject = "WARNING: Vaccine Stock Low (<40%)";

                String body = String.format(
                                "The stock for vaccine '%s' is running low (%d/%d).\n" +
                                                "Please arrange for restocking.",
                                vaccine.getName(),
                                stock,
                                capacity);

                emailService.sendSimpleEmail(vaccine.getHospital().getStaffUser().getEmail(), subject, body);

                log.info("Sent vaccine stock low alert for hospital: {}", vaccine.getHospital().getId());
        }

        @Override
        public void sendAppointmentConfirmation(Appointment appointment) {
                if (appointment.getUser() == null) {
                        return;
                }

                String subject = "Appointment Confirmation - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Your vaccination appointment has been successfully booked.\n\n" +
                                                "Details:\n" +
                                                "- Appointment ID: #%d\n" +
                                                "- Vaccine: %s\n" +
                                                "- Date: %s\n" +
                                                "- Time: %s\n" +
                                                "- Center: %s\n" +
                                                "- Address: %s\n\n" +
                                                "Please arrive 15 minutes before your scheduled time.",
                                appointment.getUser().getName(),
                                appointment.getId(),
                                appointment.getVaccine().getName(),
                                appointment.getSlot().getDate().format(DATE_FORMATTER),
                                appointment.getSlot().getStartTime().format(TIME_FORMATTER),
                                appointment.getSlot().getCenter().getName(),
                                appointment.getSlot().getCenter().getAddress());

                sendWithSignature(appointment.getUser().getEmail(), subject, content);

                log.info("Sent appointment confirmation to: {} (Appt ID: {})",
                                appointment.getUser().getEmail(), appointment.getId());
        }

        @Override
        public void sendAppointmentCancellation(Appointment appointment) {
                if (appointment.getUser() == null) {
                        return;
                }

                String subject = "Appointment Cancelled - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "The vaccination appointment #%d for %s has been CANCELLED.\n" +
                                                "If you did not request this, please contact support.",
                                appointment.getUser().getName(),
                                appointment.getId(),
                                appointment.getVaccine().getName());

                sendWithSignature(appointment.getUser().getEmail(), subject, content);

                log.info("Sent appointment cancellation notice to: {} (Appt ID: {})",
                                appointment.getUser().getEmail(), appointment.getId());
        }

        @Override
        public void sendVaccinationCompletion(Appointment appointment) {
                if (appointment.getUser() == null) {
                        return;
                }

                String subject = "Vaccination Completed - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Congratulations! Your vaccination for '%s' has been marked as COMPLETED.\n"
                                                +
                                                "You can download your certificate from the Vaxify dashboard.\n\n" +
                                                "Thank you for doing your part!",
                                appointment.getUser().getName(),
                                appointment.getVaccine().getName());

                sendWithSignature(appointment.getUser().getEmail(), subject, content);

                log.info("Sent vaccination completion notice to: {} (Appt ID: {})",
                                appointment.getUser().getEmail(), appointment.getId());
        }

        private void sendWithSignature(String to, String subject, String content) {
                String body = content + "\n\nRegards,\nVaxify Team";

                emailService.sendSimpleEmail(to, subject, body);
        }
}
