package com.vaxify.app.entities;

import com.vaxify.app.entities.enums.HospitalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "license_number", nullable = false)
    private String licenseNumber;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "hospital_document_data", columnDefinition = "LONGTEXT")
    private String documentUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User staffUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HospitalStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
