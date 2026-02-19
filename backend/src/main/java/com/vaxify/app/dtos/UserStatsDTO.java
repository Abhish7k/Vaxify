package com.vaxify.app.dtos;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserStatsDTO {
    private String upcomingAppointmentDate;
    private String vaccinationStatus;
    private int totalAppointments;
    private int completedAppointments;
    private boolean certificateAvailable;
    private List<AppointmentResponse> recentAppointments;
}
