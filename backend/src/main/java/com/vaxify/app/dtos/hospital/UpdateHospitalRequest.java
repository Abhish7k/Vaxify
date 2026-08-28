package com.vaxify.app.dtos.hospital;

import com.vaxify.app.validation.ValidationPatterns;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHospitalRequest {

    @NotBlank(message = "Hospital name is required")
    @Size(min = 2, max = 100, message = "Hospital name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be at least 5 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 1, max = 100, message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 1, max = 100, message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = ValidationPatterns.PINCODE, message = ValidationPatterns.PINCODE_MESSAGE)
    private String pincode;

    private String documentUrl;
}
