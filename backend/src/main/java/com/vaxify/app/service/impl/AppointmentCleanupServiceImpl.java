package com.vaxify.app.service.impl;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.AppointmentCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupServiceImpl implements AppointmentCleanupService {

    private final AppointmentRepository appointmentRepository;
    private final VaccineRepository vaccineRepository;

    @Override
    @Transactional
    public void cleanupOverdue() {
        log.info("starting overdue appmts cleanup task on startup");

        LocalDate today = LocalDate.now();

        List<Appointment> overdue = appointmentRepository.findByStatusAndSlotDateBefore(
                AppointmentStatus.BOOKED, today);

        processOverdue(overdue);
    }

    @Override
    @Transactional
    public void cleanupOverdueForUser(User user) {
        log.debug("starting appmt cleanup for user: {}", user.getEmail());

        LocalDate today = LocalDate.now();

        List<Appointment> overdue = appointmentRepository.findByUserAndStatusAndSlotDateBefore(
                user, AppointmentStatus.BOOKED, today);

        processOverdue(overdue);
    }

    @Override
    @Transactional
    public void cleanupOverdueForHospital(Long hospitalId) {
        log.debug("starting appmt cleanup for hospital ID: {}", hospitalId);

        LocalDate today = LocalDate.now();

        List<Appointment> overdue = appointmentRepository.findBySlotCenterIdAndStatusAndSlotDateBefore(
                hospitalId, AppointmentStatus.BOOKED, today);

        processOverdue(overdue);
    }

    private void processOverdue(List<Appointment> overdue) {
        if (overdue.isEmpty()) {
            return;
        }

        log.info("found {} overdue appmts, marking as MISSED and refunding stock", overdue.size());

        for (Appointment appointment : overdue) {
            appointment.setStatus(AppointmentStatus.MISSED);

            // refund vaccine stock as it wasnt used
            Vaccine vaccine = appointment.getVaccine();

            vaccine.setStock(vaccine.getStock() + 1);

            vaccineRepository.save(vaccine);
        }

        appointmentRepository.saveAll(overdue);

        log.info("successfully processed cleanup for {} appmts", overdue.size());
    }
}
