package com.vaxify.app.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;

import jakarta.persistence.LockModeType;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findBySlotCenterId(Long centerId);

    List<Appointment> findByUserEmail(String email);

    List<Appointment> findByUser(User user);

    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.slot s JOIN FETCH s.center JOIN FETCH a.vaccine JOIN FETCH a.user WHERE a.user = :user")
    List<Appointment> findByUserWithDetails(@Param("user") User user);

    List<Appointment> findByVaccineIn(List<Vaccine> vaccines);

    List<Appointment> findBySlot(Slot slot);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a JOIN a.slot s WHERE a.status = :status "
            + "AND (s.date < :today OR (s.date = :today AND s.endTime < :nowTime))")
    List<Appointment> findOverdueByStatus(@Param("status") AppointmentStatus status,
            @Param("today") LocalDate today, @Param("nowTime") LocalTime nowTime);

    boolean existsByUser(User user);

    boolean existsBySlot(Slot slot);

    boolean existsBySlotAndStatus(Slot slot, AppointmentStatus status);

    boolean existsByUserAndSlotAndStatus(User user, Slot slot, AppointmentStatus status);

    boolean existsByVaccineAndStatus(Vaccine vaccine, AppointmentStatus status);

    boolean existsByVaccine(Vaccine vaccine);

    boolean existsBySlotCenterIdAndStatus(Long hospitalId, AppointmentStatus status);

    boolean existsBySlotCenterId(Long hospitalId);

    void deleteAllBySlot(Slot slot);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a JOIN a.slot s WHERE a.user = :user AND a.status = :status "
            + "AND (s.date < :today OR (s.date = :today AND s.endTime < :nowTime))")
    List<Appointment> findOverdueByUserAndStatus(@Param("user") User user,
            @Param("status") AppointmentStatus status, @Param("today") LocalDate today,
            @Param("nowTime") LocalTime nowTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a JOIN a.slot s WHERE s.center.id = :hospitalId AND a.status = :status "
            + "AND (s.date < :today OR (s.date = :today AND s.endTime < :nowTime))")
    List<Appointment> findOverdueByHospitalIdAndStatus(@Param("hospitalId") Long hospitalId,
            @Param("status") AppointmentStatus status, @Param("today") LocalDate today,
            @Param("nowTime") LocalTime nowTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a WHERE a.id = :id")
    Optional<Appointment> findByIdForUpdate(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Appointment a SET a.status = :missed WHERE a.id = :id AND a.status = :booked")
    int markMissedIfBooked(@Param("id") Long id, @Param("missed") AppointmentStatus missed,
            @Param("booked") AppointmentStatus booked);
}
