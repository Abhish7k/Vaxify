package com.vaxify.app.dtos.notification;

public record VaccineStockMailData(
        String staffEmail,
        String vaccineName,
        int stock,
        int capacity,
        Long hospitalId) {
}
