package com.vaxify.app.dtos.user;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserStatsResponse {

    private String upcomingAppointmentDate;

    private String vaccinationStatus;

    private long totalAppointments;

    private long pendingAppointments;

    private long completedAppointments;

    private boolean certificateAvailable;

    private List<AppointmentResponse> recentAppointments;

}
