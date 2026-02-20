package com.vaxify.app.dtos.hospital;

import java.time.LocalDateTime;
import java.util.List;

import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.entities.enums.HospitalStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HospitalResponse {

    private Long id;
    private String name;
    private String address;
    private String licenseNumber;
    private String documentUrl;
    private String city;
    private String state;
    private String pincode;
    private HospitalStatus status;
    private String staffName;
    private String staffEmail;
    private String staffPhone;
    private LocalDateTime staffCreatedAt;
    private List<VaccineResponse> availableVaccines;
}
