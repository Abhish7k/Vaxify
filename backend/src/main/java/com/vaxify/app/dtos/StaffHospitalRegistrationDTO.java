package com.vaxify.app.dtos;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffHospitalRegistrationDTO {

    @NotBlank(message = "Staff name is required")
    private String staffName;

    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // ===== HOSPITAL INFO =====

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotBlank(message = "Hospital address is required")
    private String hospitalAddress;

    @NotBlank(message = "Hospital license number is required")
    private String licenseNumber;

    // Optional (for future use)
    private String city;
    private String state;
    private String pincode;
    
}
