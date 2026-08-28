package com.vaxify.app.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vaxify.app.entities.Slot;

import jakarta.persistence.LockModeType;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByCenterId(Long hospitalId);

    List<Slot> findByCenterIdAndDate(Long hospitalId, LocalDate date);

    boolean existsByCenterIdAndDateAndStartTime(Long centerId, LocalDate date, LocalTime startTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.center.id = :centerId AND s.date = :date AND s.startTime = :startTime")
    Optional<Slot> findByCenterIdAndDateAndStartTimeForUpdate(@Param("centerId") Long centerId,
            @Param("date") LocalDate date, @Param("startTime") LocalTime startTime);
}
