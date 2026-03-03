package com.vaxify.app.service;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.entities.Slot;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse bookAppointment(BookAppointmentRequest request, String userEmail);

    List<AppointmentResponse> getMyAppointments(String userEmail);

    void cancelAppointment(Long appointmentId, String userEmail);

    AppointmentResponse getAppointmentById(Long id);

    List<AppointmentResponse> getAppointmentsByHospital(Long hospitalId);

    void completeAppointment(Long appointmentId);

    boolean hasActiveBookings(Slot slot);

    void deleteAppointmentsBySlot(Slot slot);
}
