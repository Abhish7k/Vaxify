package com.vaxify.app.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;
import java.time.LocalDate;

import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findBySlotCenterId(Long centerId);

    List<Appointment> findByUserEmail(String email);

    List<Appointment> findByUser(User user);

    List<Appointment> findByVaccineIn(List<Vaccine> vaccines);

    List<Appointment> findBySlot(Slot slot);

    List<Appointment> findByStatusAndSlotDateBefore(AppointmentStatus status, LocalDate date);

    boolean existsBySlotAndStatus(Slot slot, AppointmentStatus status);

    void deleteAllBySlot(Slot slot);

    long countByUserAndStatus(User user, AppointmentStatus status);

    List<Appointment> findTop3ByUserOrderByCreatedAtDesc(User user);

    List<Appointment> findByUserAndStatusAndSlotDateBefore(User user, AppointmentStatus status, LocalDate date);

    List<Appointment> findBySlotCenterIdAndStatusAndSlotDateBefore(Long hospitalId, AppointmentStatus status,
            LocalDate date);
}
