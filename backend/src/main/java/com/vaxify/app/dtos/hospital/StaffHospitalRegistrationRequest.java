package com.vaxify.app.dtos.hospital;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.vaxify.app.validation.ValidationPatterns;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffHospitalRegistrationRequest {

    @NotBlank(message = "Staff name is required")
    @Size(min = 2, max = 100, message = "Staff name must be between 2 and 100 characters")
    private String staffName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = ValidationPatterns.PHONE, message = ValidationPatterns.PHONE_MESSAGE)
    private String phone;

    @NotBlank(message = "Hospital name is required")
    @Size(min = 2, max = 100, message = "Hospital name must be between 2 and 100 characters")
    private String hospitalName;

    @NotBlank(message = "Hospital address is required")
    @Size(min = 5, max = 255, message = "Hospital address must be at least 5 characters")
    private String hospitalAddress;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Verification document is required")
    private String document;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 100, message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = ValidationPatterns.PINCODE, message = ValidationPatterns.PINCODE_MESSAGE)
    private String pincode;

}
