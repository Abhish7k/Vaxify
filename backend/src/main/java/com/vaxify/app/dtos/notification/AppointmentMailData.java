package com.vaxify.app.dtos.notification;

public record AppointmentMailData(
        Long appointmentId,
        String recipientName,
        String recipientEmail,
        String vaccineName,
        String date,
        String time,
        String centerName,
        String centerAddress) {
}
