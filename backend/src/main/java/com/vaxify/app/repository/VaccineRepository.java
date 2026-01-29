package com.vaxify.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Vaccine;

import org.springframework.stereotype.Repository;

@Repository
public interface  VaccineRepository extends JpaRepository<Vaccine, Long> {
    
}
