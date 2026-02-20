package com.vaxify.app.service;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Vaccine;

public interface NotificationService {

    void sendHospitalRegistrationReceived(Hospital hospital);

    void sendHospitalApproved(Hospital hospital);

    void sendHospitalRejected(Hospital hospital);

    void sendVaccineStockCritical(Vaccine vaccine, int stock, int capacity);

    void sendVaccineStockLow(Vaccine vaccine, int stock, int capacity);

    void sendAppointmentConfirmation(Appointment appointment);

    void sendAppointmentCancellation(Appointment appointment);

    void sendVaccinationCompletion(Appointment appointment);
}
