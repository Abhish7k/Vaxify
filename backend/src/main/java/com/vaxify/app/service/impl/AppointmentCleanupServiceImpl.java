package com.vaxify.app.service.impl;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.SlotStatus;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.SlotRepository;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.AppointmentCleanupService;
import com.vaxify.app.time.BusinessClock;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupServiceImpl implements AppointmentCleanupService {

    private static final String CLEANUP_LOCK = "vaxify_overdue_cleanup";

    private final AppointmentRepository appointmentRepository;
    private final VaccineRepository vaccineRepository;
    private final SlotRepository slotRepository;
    private final BusinessClock businessClock;

    @PersistenceContext
    private EntityManager entityManager;

    @Scheduled(cron = "${app.cleanup.cron:0 10 * * * *}", zone = "${app.timezone:Asia/Kolkata}")
    @Transactional
    public void runScheduledCleanup() {
        cleanupOverdue();
    }

    @Override
    @Transactional
    public void cleanupOverdue() {
        if (!tryAcquireLock()) {
            log.info("overdue cleanup already running; skipping");
            return;
        }

        try {
            log.info("starting overdue appointments cleanup");

            List<Appointment> overdue = appointmentRepository.findOverdueByStatus(
                    AppointmentStatus.BOOKED, businessClock.today(), businessClock.nowTime());

            processOverdue(overdue);
        } finally {
            releaseLock();
        }
    }

    @Override
    @Transactional
    public void cleanupOverdueForUser(User user) {
        if (!tryAcquireLock()) {
            log.info("overdue cleanup already running; skipping user {}", user.getEmail());
            return;
        }

        try {
            List<Appointment> overdue = appointmentRepository.findOverdueByUserAndStatus(
                    user, AppointmentStatus.BOOKED, businessClock.today(), businessClock.nowTime());
            processOverdue(overdue);
        } finally {
            releaseLock();
        }
    }

    @Override
    @Transactional
    public void cleanupOverdueForHospital(Long hospitalId) {
        if (!tryAcquireLock()) {
            log.info("overdue cleanup already running; skipping hospital {}", hospitalId);
            return;
        }

        try {
            List<Appointment> overdue = appointmentRepository.findOverdueByHospitalIdAndStatus(
                    hospitalId, AppointmentStatus.BOOKED, businessClock.today(), businessClock.nowTime());
            processOverdue(overdue);
        } finally {
            releaseLock();
        }
    }

    private void processOverdue(List<Appointment> overdue) {
        if (overdue.isEmpty()) {
            return;
        }

        log.info("found {} overdue appmts, marking as MISSED and refunding stock", overdue.size());

        int marked = 0;

        for (Appointment appointment : overdue) {
            Long vaccineId = appointment.getVaccine().getId();
            Long slotId = appointment.getSlot().getId();

            int updated = appointmentRepository.markMissedIfBooked(
                    appointment.getId(), AppointmentStatus.MISSED, AppointmentStatus.BOOKED);

            if (updated != 1) {
                continue;
            }

            marked++;
            refundVaccine(vaccineId);
            releaseSlot(slotId);
        }

        log.info("successfully processed cleanup for {} appmts", marked);
    }

    private void refundVaccine(Long vaccineId) {
        vaccineRepository.findByIdForUpdate(vaccineId).ifPresent(lockedVaccine -> {
            int stock = lockedVaccine.getStock() == null ? 0 : lockedVaccine.getStock();
            Integer capacity = lockedVaccine.getCapacity();
            if (capacity == null || stock < capacity) {
                lockedVaccine.setStock(stock + 1);
                vaccineRepository.save(lockedVaccine);
            }
        });
    }

    private void releaseSlot(Long slotId) {
        slotRepository.findByIdForUpdate(slotId).ifPresent(lockedSlot -> {
            if (lockedSlot.getBookedCount() > 0) {
                lockedSlot.setBookedCount(lockedSlot.getBookedCount() - 1);
            }

            if (lockedSlot.getStatus() == SlotStatus.FULL
                    && lockedSlot.getBookedCount() < lockedSlot.getCapacity()) {
                lockedSlot.setStatus(SlotStatus.AVAILABLE);
            }

            slotRepository.save(lockedSlot);
        });
    }

    private boolean tryAcquireLock() {
        Object result = entityManager
                .createNativeQuery("SELECT GET_LOCK('" + CLEANUP_LOCK + "', 5)")
                .getSingleResult();
        return result != null && ((Number) result).intValue() == 1;
    }

    private void releaseLock() {
        entityManager.createNativeQuery("SELECT RELEASE_LOCK('" + CLEANUP_LOCK + "')")
                .getSingleResult();
    }
}
