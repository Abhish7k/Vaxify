package com.vaxify.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vaxify.app.entities.Vaccine;

import org.springframework.stereotype.Repository;

import com.vaxify.app.entities.Hospital;
import java.util.List;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, Long> {
    List<Vaccine> findByHospital(Hospital hospital);

    List<Vaccine> findByHospitalIn(List<Hospital> hospitals);

    @Query("SELECT v FROM Vaccine v WHERE v.stock >= (v.capacity * 0.2)")
    List<Vaccine> findAllAvailable();

    @Query("SELECT v FROM Vaccine v WHERE v.hospital.id = :hospitalId AND v.stock >= (v.capacity * 0.2)")
    List<Vaccine> findAvailableByHospitalId(@Param("hospitalId") Long hospitalId);
}
