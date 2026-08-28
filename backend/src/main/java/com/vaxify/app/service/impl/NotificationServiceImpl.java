package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.notification.AppointmentMailData;
import com.vaxify.app.dtos.notification.HospitalMailData;
import com.vaxify.app.dtos.notification.VaccineStockMailData;
import com.vaxify.app.service.EmailService;
import com.vaxify.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

        private final EmailService emailService;

        @Override
        @Async
        public void sendHospitalRegistrationReceived(HospitalMailData data) {
                if (data == null || data.staffEmail() == null) {
                        return;
                }

                String subject = "Hospital Registration Received - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "You have successfully registered your hospital '%s' on Vaxify.\n" +
                                                "Your application is currently PENDING approval from the admin.\n" +
                                                "You will be notified once the status changes.",
                                data.staffName(),
                                data.hospitalName());

                sendWithSignature(data.staffEmail(), subject, content, "hospital registration received");
        }

        @Override
        @Async
        public void sendHospitalApproved(HospitalMailData data) {
                if (data == null || data.staffEmail() == null) {
                        return;
                }

                String subject = "Hospital Registration Approved - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Your hospital registration for '%s' has been APPROVED by the admin.\n"
                                                +
                                                "You can now login and manage your hospital dashboard.",
                                data.staffName(),
                                data.hospitalName());

                sendWithSignature(data.staffEmail(), subject, content, "hospital approved");
        }

        @Override
        @Async
        public void sendHospitalRejected(HospitalMailData data) {
                if (data == null || data.staffEmail() == null) {
                        return;
                }

                String subject = "Hospital Registration Rejected - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Your hospital registration for '%s' has been REJECTED by the admin.\n"
                                                +
                                                "Please contact support for more details.",
                                data.staffName(),
                                data.hospitalName());

                sendWithSignature(data.staffEmail(), subject, content, "hospital rejected");
        }

        @Override
        @Async
        public void sendVaccineStockCritical(VaccineStockMailData data) {
                if (data == null || data.staffEmail() == null) {
                        return;
                }

                String subject = "CRITICAL: Vaccine Stock Critical (<20%)";

                String body = String.format(
                                "The stock for vaccine '%s' is CRITICAL (%d/%d).\n" +
                                                "Please restock immediately so bookings are not interrupted.",
                                data.vaccineName(),
                                data.stock(),
                                data.capacity());

                sendDirect(data.staffEmail(), subject, body,
                                "vaccine stock critical alert for hospital " + data.hospitalId());
        }

        @Override
        @Async
        public void sendVaccineStockLow(VaccineStockMailData data) {
                if (data == null || data.staffEmail() == null) {
                        return;
                }

                String subject = "WARNING: Vaccine Stock Low (<40%)";

                String body = String.format(
                                "The stock for vaccine '%s' is running low (%d/%d).\n" +
                                                "Please arrange for restocking.",
                                data.vaccineName(),
                                data.stock(),
                                data.capacity());

                sendDirect(data.staffEmail(), subject, body,
                                "vaccine stock low alert for hospital " + data.hospitalId());
        }

        @Override
        @Async
        public void sendAppointmentConfirmation(AppointmentMailData data) {
                if (data == null || data.recipientEmail() == null) {
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
                                data.recipientName(),
                                data.appointmentId(),
                                data.vaccineName(),
                                data.date(),
                                data.time(),
                                data.centerName(),
                                data.centerAddress());

                sendWithSignature(data.recipientEmail(), subject, content,
                                "appointment confirmation for " + data.appointmentId());
        }

        @Override
        @Async
        public void sendAppointmentCancellation(AppointmentMailData data) {
                if (data == null || data.recipientEmail() == null) {
                        return;
                }

                String subject = "Appointment Cancelled - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "The vaccination appointment #%d for %s has been CANCELLED.\n" +
                                                "If you did not request this, please contact support.",
                                data.recipientName(),
                                data.appointmentId(),
                                data.vaccineName());

                sendWithSignature(data.recipientEmail(), subject, content,
                                "appointment cancellation for " + data.appointmentId());
        }

        @Override
        @Async
        public void sendVaccinationCompletion(AppointmentMailData data) {
                if (data == null || data.recipientEmail() == null) {
                        return;
                }

                String subject = "Vaccination Completed - Vaxify";

                String content = String.format(
                                "Dear %s,\n\n" +
                                                "Congratulations! Your vaccination for '%s' has been marked as COMPLETED.\n"
                                                +
                                                "You can download your certificate from the Vaxify dashboard.\n\n" +
                                                "Thank you for doing your part!",
                                data.recipientName(),
                                data.vaccineName());

                sendWithSignature(data.recipientEmail(), subject, content,
                                "vaccination completion for " + data.appointmentId());
        }

        private void sendWithSignature(String to, String subject, String content, String purpose) {
                sendDirect(to, subject, content + "\n\nRegards,\nVaxify Team", purpose);
        }

        private void sendDirect(String to, String subject, String body, String purpose) {
                try {
                        emailService.sendSimpleEmail(to, subject, body);
                        log.info("Sent {} to {}", purpose, to);
                } catch (Exception e) {
                        log.error("Failed to send {} to {}", purpose, to, e);
                }
        }
}
