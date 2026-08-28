package com.vaxify.app.service;

import com.vaxify.app.dtos.notification.AppointmentMailData;
import com.vaxify.app.dtos.notification.HospitalMailData;
import com.vaxify.app.dtos.notification.VaccineStockMailData;

public interface NotificationService {

    void sendHospitalRegistrationReceived(HospitalMailData data);

    void sendHospitalApproved(HospitalMailData data);

    void sendHospitalRejected(HospitalMailData data);

    void sendVaccineStockCritical(VaccineStockMailData data);

    void sendVaccineStockLow(VaccineStockMailData data);

    void sendAppointmentConfirmation(AppointmentMailData data);

    void sendAppointmentCancellation(AppointmentMailData data);

    void sendVaccinationCompletion(AppointmentMailData data);
}
