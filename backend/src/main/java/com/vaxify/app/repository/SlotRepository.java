package com.vaxify.app.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vaxify.app.entities.Slot;

import org.springframework.stereotype.Repository;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long>{

    List<Slot> findByCenterId(Long hospitalId);

    List<Slot> findByCenterIdAndDate(Long hospitalId, LocalDate date);
    
}
