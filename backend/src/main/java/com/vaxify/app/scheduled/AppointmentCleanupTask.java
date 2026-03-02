package com.vaxify.app.scheduled;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.repository.AppointmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * automated tasks for appt lifecycle mgmt
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupTask {

    private final AppointmentRepository appointmentRepository;

    /**
     * marks booked appts that are in the past as MISSED
     * runs every day at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOverdueAppointments() {
        log.info("starting overdue appts cleanup task");

        LocalDate today = LocalDate.now();

        List<Appointment> overdue = appointmentRepository.findByStatusAndSlotDateBefore(
                AppointmentStatus.BOOKED, today);

        if (overdue.isEmpty()) {
            log.info("no overdue appts found to cleanup");

            return;
        }

        log.info("found {} overdue appts, marking as MISSED and refunding stock", overdue.size());

        for (Appointment appointment : overdue) {
            appointment.setStatus(AppointmentStatus.MISSED);

            // refund vaccine stock as it wasn't used
            Vaccine vaccine = appointment.getVaccine();

            vaccine.setStock(vaccine.getStock() + 1);
        }

        appointmentRepository.saveAll(overdue);

        log.info("successfully marked {} appts as MISSED and restored vaccine stock", overdue.size());
    }

}
