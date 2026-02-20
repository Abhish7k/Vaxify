package com.vaxify.app.service.impl;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.service.EmailService;
import com.vaxify.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final EmailService emailService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Override
    public void sendHospitalRegistrationReceived(Hospital hospital) {
        if (hospital.getStaffUser() == null)
            return;

        String subject = "Hospital Registration Received - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "You have successfully registered your hospital '%s' on Vaxify.\n" +
                        "Your application is currently PENDING approval from the admin.\n" +
                        "You will be notified once the status changes.\n\n" +
                        "Regards,\nVaxify Team",
                hospital.getStaffUser().getName(),
                hospital.getName());

        emailService.sendSimpleEmail(hospital.getStaffUser().getEmail(), subject, body);
    }

    @Override
    public void sendHospitalApproved(Hospital hospital) {
        if (hospital.getStaffUser() == null)
            return;

        String subject = "Hospital Registration Approved - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "Your hospital registration for '%s' has been APPROVED by the admin.\n" +
                        "You can now login and manage your hospital dashboard.\n\n" +
                        "Regards,\nVaxify Team",
                hospital.getStaffUser().getName(),
                hospital.getName());

        emailService.sendSimpleEmail(hospital.getStaffUser().getEmail(), subject, body);
    }

    @Override
    public void sendHospitalRejected(Hospital hospital) {
        if (hospital.getStaffUser() == null)
            return;

        String subject = "Hospital Registration Rejected - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "Your hospital registration for '%s' has been REJECTED by the admin.\n" +
                        "Please contact support for more details.\n\n" +
                        "Regards,\nVaxify Team",
                hospital.getStaffUser().getName(),
                hospital.getName());

        emailService.sendSimpleEmail(hospital.getStaffUser().getEmail(), subject, body);
    }

    @Override
    public void sendVaccineStockCritical(Vaccine vaccine, int stock, int capacity) {
        if (vaccine.getHospital() == null || vaccine.getHospital().getStaffUser() == null)
            return;

        String subject = "CRITICAL: Vaccine Stock Critical (<20%) - Booking Blocked Warning";

        String body = String.format(
                "The stock for vaccine '%s' is CRITICAL (%d/%d).\n" +
                        "Bookings may be blocked soon if stock runs out. Please restock immediately.",
                vaccine.getName(),
                stock,
                capacity);

        emailService.sendSimpleEmail(vaccine.getHospital().getStaffUser().getEmail(), subject, body);
    }

    @Override
    public void sendVaccineStockLow(Vaccine vaccine, int stock, int capacity) {
        if (vaccine.getHospital() == null || vaccine.getHospital().getStaffUser() == null)
            return;

        String subject = "WARNING: Vaccine Stock Low (<40%)";

        String body = String.format(
                "The stock for vaccine '%s' is running low (%d/%d).\n" +
                        "Please arrange for restocking.",
                vaccine.getName(),
                stock,
                capacity);

        emailService.sendSimpleEmail(vaccine.getHospital().getStaffUser().getEmail(), subject, body);
    }

    // to the registered users
    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        if (appointment.getUser() == null)
            return;

        String subject = "Appointment Confirmation - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "Your vaccination appointment has been successfully booked.\n\n" +
                        "Details:\n" +
                        "- Appointment ID: #%d\n" +
                        "- Vaccine: %s\n" +
                        "- Date: %s\n" +
                        "- Time: %s\n" +
                        "- Center: %s\n" +
                        "- Address: %s\n\n" +
                        "Please arrive 15 minutes before your scheduled time.\n\n" +
                        "Regards,\nVaxify Team",
                appointment.getUser().getName(),
                appointment.getId(),
                appointment.getVaccine().getName(),
                appointment.getSlot().getDate().format(DATE_FORMATTER),
                appointment.getSlot().getStartTime().format(TIME_FORMATTER),
                appointment.getSlot().getCenter().getName(),
                appointment.getSlot().getCenter().getAddress());

        emailService.sendSimpleEmail(appointment.getUser().getEmail(), subject, body);
    }

    @Override
    public void sendAppointmentCancellation(Appointment appointment) {
        if (appointment.getUser() == null)
            return;

        String subject = "Appointment Cancelled - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "The vaccination appointment #%d for %s has been CANCELLED.\n" +
                        "If you did not request this, please contact support.\n\n" +
                        "Regards,\nVaxify Team",
                appointment.getUser().getName(),
                appointment.getId(),
                appointment.getVaccine().getName());

        emailService.sendSimpleEmail(appointment.getUser().getEmail(), subject, body);
    }

    @Override
    public void sendVaccinationCompletion(Appointment appointment) {
        if (appointment.getUser() == null)
            return;

        String subject = "Vaccination Completed - Vaxify";

        String body = String.format(
                "Dear %s,\n\n" +
                        "Congratulations! Your vaccination for '%s' has been marked as COMPLETED.\n" +
                        "You can download your certificate from the Vaxify dashboard.\n\n" +
                        "Thank you for doing your part!\n\n" +
                        "Regards,\nVaxify Team",
                appointment.getUser().getName(),
                appointment.getVaccine().getName());

        emailService.sendSimpleEmail(appointment.getUser().getEmail(), subject, body);
    }
}
