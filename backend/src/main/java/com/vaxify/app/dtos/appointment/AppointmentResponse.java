package com.vaxify.app.dtos.appointment;

import com.vaxify.app.entities.enums.AppointmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;
    private Long centerId;
    private String centerName;
    private String centerAddress;
    private Long vaccineId;
    private String vaccineName;
    private String date;
    private String slot;
    private String endTime;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
}
