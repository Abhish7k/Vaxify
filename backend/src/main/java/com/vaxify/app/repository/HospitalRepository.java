package com.vaxify.app.repository;

import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.enums.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByStaffUser(User staffUser);

    @Query("SELECT h FROM Hospital h JOIN FETCH h.staffUser WHERE h.id = :id")
    Optional<Hospital> findByIdWithStaff(@Param("id") Long id);

    @Query("SELECT h FROM Hospital h JOIN FETCH h.staffUser WHERE h.status = :status")
    List<Hospital> findByStatusWithStaff(@Param("status") HospitalStatus status);

    @Query("SELECT h FROM Hospital h JOIN FETCH h.staffUser")
    List<Hospital> findAllWithStaff();

    long countByStatus(HospitalStatus status);

    List<Hospital> findAllByOrderByCreatedAtDesc();
}
