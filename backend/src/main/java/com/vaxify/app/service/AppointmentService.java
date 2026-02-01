package com.vaxify.app.service;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail);

    List<AppointmentResponse> getMyAppointments(String userEmail);

    void cancelAppointment(Long appointmentId, String userEmail);

    AppointmentResponse getAppointmentById(Long id);

    List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId);

    void completeAppointment(Long appointmentId);

    void checkStockAlerts(com.vaxify.app.entities.Vaccine vaccine);
}
