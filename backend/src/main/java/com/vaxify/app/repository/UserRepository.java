package com.vaxify.app.repository;

import com.vaxify.app.entities.User;
import com.vaxify.app.entities.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findTop5ByRoleOrderByCreatedAtDesc(Role role);
}