package com.vaxify.app.scheduled;

import org.springframework.stereotype.Component;

import com.vaxify.app.service.AppointmentService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * automated tasks for appt lifecycle mgmt
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupTask {

    private final AppointmentService appointmentService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("triggering missed appmt cleanup task on application ready");

        appointmentService.cleanupOverdueAppointments();
    }

    /**
     * marks booked appts that are in the past as MISSED
     * runs every day at midnight
     */
    public void cleanupOverdueAppointments() {
        appointmentService.cleanupOverdueAppointments();
    }

}
