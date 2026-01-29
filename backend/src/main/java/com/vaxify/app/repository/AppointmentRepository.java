package com.vaxify.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Appointment;

import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>{
    
}
