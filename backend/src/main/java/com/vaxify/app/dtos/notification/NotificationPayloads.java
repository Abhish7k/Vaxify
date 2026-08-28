package com.vaxify.app.dtos.notification;

import java.time.format.DateTimeFormatter;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;

public final class NotificationPayloads {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    private NotificationPayloads() {
    }

    public static AppointmentMailData fromAppointment(Appointment appointment) {
        User user = appointment.getUser();
        Vaccine vaccine = appointment.getVaccine();
        Slot slot = appointment.getSlot();
        Hospital center = slot != null ? slot.getCenter() : null;

        return new AppointmentMailData(
                appointment.getId(),
                user != null ? user.getName() : null,
                user != null ? user.getEmail() : null,
                vaccine != null ? vaccine.getName() : null,
                slot != null && slot.getDate() != null ? slot.getDate().format(DATE_FORMATTER) : null,
                slot != null && slot.getStartTime() != null ? slot.getStartTime().format(TIME_FORMATTER) : null,
                center != null ? center.getName() : null,
                center != null ? center.getAddress() : null);
    }

    public static HospitalMailData fromHospital(Hospital hospital) {
        User staff = hospital.getStaffUser();

        return new HospitalMailData(
                staff != null ? staff.getName() : null,
                staff != null ? staff.getEmail() : null,
                hospital.getName());
    }

    public static VaccineStockMailData fromVaccine(Vaccine vaccine, int stock, int capacity) {
        Hospital hospital = vaccine.getHospital();
        User staff = hospital != null ? hospital.getStaffUser() : null;

        return new VaccineStockMailData(
                staff != null ? staff.getEmail() : null,
                vaccine.getName(),
                stock,
                capacity,
                hospital != null ? hospital.getId() : null);
    }
}
