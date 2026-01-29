package com.vaxify.app.dtos.hospital;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StaffHospitalRegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String address;
}
