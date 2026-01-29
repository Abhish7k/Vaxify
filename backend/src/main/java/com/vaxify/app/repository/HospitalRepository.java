package com.vaxify.app.repository;

import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.enums.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByStaffUser(User staffUser);

    List<Hospital> findByStatus(HospitalStatus status);

    
}
