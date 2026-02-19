package com.vaxify.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Vaccine;

import org.springframework.stereotype.Repository;

import com.vaxify.app.entities.Hospital;
import java.util.List;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, Long> {
    List<Vaccine> findByHospital(Hospital hospital);

    List<Vaccine> findByHospitalIn(List<Hospital> hospitals);
}
