package com.vaxify.app.service;

import com.vaxify.app.entities.User;

public interface AppointmentCleanupService {
    void cleanupOverdue();

    void cleanupOverdueForUser(User user);

    void cleanupOverdueForHospital(Long hospitalId);
}
