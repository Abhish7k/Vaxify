package com.vaxify.app.mapper;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.entities.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    public AppointmentResponse toResponse(Appointment a) {
        if (a == null)
            return null;

        return AppointmentResponse.builder()
                .id(a.getId())
                .centerId(a.getSlot().getCenter().getId())
                .centerName(a.getSlot().getCenter().getName())
                .centerAddress(a.getSlot().getCenter().getAddress())
                .vaccineId(a.getVaccine().getId())
                .vaccineName(a.getVaccine().getName())
                .date(a.getSlot().getDate().toString())
                .slot(a.getSlot().getStartTime().toString())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .patientName(a.getUser().getName())
                .patientEmail(a.getUser().getEmail())
                .patientPhone(a.getUser().getPhone())
                .build();
    }
}
