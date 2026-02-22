package com.vaxify.app.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;

import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findBySlotCenterId(Long centerId);

    List<Appointment> findByUserEmail(String email);

    List<Appointment> findByUser(User user);

    List<Appointment> findByVaccineIn(List<Vaccine> vaccines);

    List<Appointment> findBySlot(Slot slot);
}
